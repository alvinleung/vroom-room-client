import { tryCatch } from "./utils/try-catch";
import { renderUser, UserState } from "./user";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { connectServer, SharedState, StateSync } from "./network";
import { createResizableCanvas } from "./utils/canvas";
import { getRandomColor } from "./utils/get-random-color";
import { Input } from "./input";

export async function init() {
  // setup the basic canvas
  const { canvas, context } = createResizableCanvas();

  const keyboard = Input.createKeyboardProvider();
  console.log("connecting...");

  // the global list of other users
  const allUsers = new Map<string, UserState>();

  // try connecting to server
  const [socket, err] = await tryCatch(connectServer());

  if (err) throw "Unable to establish connection: " + err;
  console.log("connected");

  // populate the map with initial state
  const serverSideUsers = await StateSync.fetchWorld(socket);
  serverSideUsers.forEach((user) => {
    allUsers.set(user.id, user);
  });

  const incomingStateMutations = await StateSync.createMutationQueue(socket);

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
  allUsers.set(self.id, self);
  StateSync.markNeedUpdate(self);

  return {
    socket,
    self,
    allUsers,
    context,
    canvas,
    keyboard,
    incomingStateMutations,
  };
}

export function update({
  self,
  allUsers,
  context,
  canvas,
  keyboard,
  socket,
  incomingStateMutations,
}: Awaited<ReturnType<typeof init>>) {
  // clear canavs for previous rendering
  context.clearRect(0, 0, canvas.width, canvas.height);

  // capture input
  const inputXAxis =
    Input.getAxis(keyboard, "ArrowRight", "ArrowLeft") ||
    Input.getAxis(keyboard, "d", "a");
  const inputYAxis =
    Input.getAxis(keyboard, "ArrowDown", "ArrowUp") ||
    Input.getAxis(keyboard, "s", "w");

  const charSpeed = 4;

  self.velX = inputXAxis * charSpeed;
  self.velY = inputYAxis * charSpeed;

  self.x += self.velX;
  self.y += self.velY;

  // detect changes
  if (self.velX != 0 || self.velY != 0) {
    StateSync.markNeedUpdate(self);
  }

  StateSync.applyIncomingMutations(socket, allUsers, incomingStateMutations);
  StateSync.emitLocalMutations(socket, allUsers);

  // render user
  allUsers.forEach((user) => renderUser(context, user));
}
