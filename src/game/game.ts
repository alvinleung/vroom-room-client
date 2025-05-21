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
  initNetworkState,
  markNeedUpdate,
  SharedState,
  syncNetworkState,
} from "./network";
import { createResizableCanvas } from "./utils/canvas";
import { getRandomColor } from "./utils/get-random-color";
import { createKeyboardProvider, getInputAxis } from "./input";

export async function init() {
  // setup the basic canvas
  const { canvas, context } = createResizableCanvas();

  const keyboard = createKeyboardProvider();
  console.log("connecting...");

  // the global list of other users
  const other = new Map<string, UserState>();

  // try connecting to server
  const [socket, err] = await tryCatch(connectServer());

  if (err) throw "Unable to establish connection: " + err;
  console.log("connected");

  const incomingStateMutation = await initNetworkState(socket, other);

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
  markNeedUpdate(self);

  return {
    socket,
    self,
    other,
    context,
    canvas,
    keyboard,
    incomingStateMutation,
  };
}

export function update({
  self,
  other,
  context,
  canvas,
  keyboard,
  socket,
  incomingStateMutation,
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
    markNeedUpdate(self);
  }

  syncNetworkState(
    socket,
    {
      self,
      other,
    },
    incomingStateMutation,
  );

  // render user
  other.forEach((user) => renderUser(context, user));
  renderUser(context, self);
}
