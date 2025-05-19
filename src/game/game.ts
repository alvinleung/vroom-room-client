import { tryCatch } from "./utils/try-catch";
import { renderUser, UserState } from "./user";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import {
  connectServer,
  fetchOthers,
  emitUserStateThrottled,
  markDirty,
  SharedState,
} from "./network";
import { createResizableCanvas } from "./utils/canvas";
import { getRandomColor } from "./utils/get-random-color";
import { createKeyboardProvider, getInputAxis } from "./input";

export async function init() {
  // setup the basic canvas
  const { canvas, context } = createResizableCanvas();

  const keyboard = createKeyboardProvider();
  console.log("connecting...");

  // try connecting to server
  const [socket, err] = await tryCatch(connectServer());

  if (err) throw "Unable to establish connection: " + err;
  console.log("connected");

  const self: SharedState<UserState> = {
    id: socket.id!,
    name: uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] }),
    color: getRandomColor(),
    x: 0,
    y: 0,
    velX: 0,
    velY: 0,
    message: "",
  };

  // the global list of other users
  const other = new Map<string, UserState>();

  // handle deleting user
  socket.on("user-delete", (user: UserState) => {
    other.delete(user.id);
    console.log(`user ${user.id} deleted`);
  });

  socket.on("user-add", (user: UserState) => {
    other.set(user.id, user);
    console.log(`user ${user.id} added`);
  });

  socket.on("user-update", (user: UserState) => {
    console.log(`user ${user.id} update receive`);
    const targetUser = other.get(user.id);
    if (!targetUser) {
      console.log("attempting to update non-existant user ", user.id);
      return;
    }
    Object.assign(targetUser, user);
  });

  // populate the map with users
  const serverSideUsers = await fetchOthers(socket);
  serverSideUsers.forEach((user) => other.set(user.id, user));

  // add the user to the server
  emitUserStateThrottled(socket, self, 0);

  return { socket, self, other, context, canvas, keyboard };
}

export function update({
  self,
  other,
  context,
  canvas,
  keyboard,
  socket,
}: Awaited<ReturnType<typeof init>>) {
  // clear canavs for previous rendering
  context.clearRect(0, 0, canvas.width, canvas.height);

  // capture input
  const inputXAxis =
    getInputAxis(keyboard, "ArrowRight", "ArrowLeft") ||
    getInputAxis(keyboard, "d", "a");
  const inputYAxis =
    getInputAxis(keyboard, "ArrowDown", "ArrowUp") ||
    getInputAxis(keyboard, "s", "w");

  const charSpeed = 4;

  self.velX = inputXAxis * charSpeed;
  self.velY = inputYAxis * charSpeed;

  self.x += self.velX;
  self.y += self.velY;

  // detect changes
  if (self.velX != 0 || self.velY != 0) {
    markDirty(self);
  }

  // upload changes
  if (self._dirty) emitUserStateThrottled(socket, self, 0);

  // render user
  other.forEach((user) => renderUser(context, user));
  renderUser(context, self);
}
