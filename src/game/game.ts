import { tryCatch } from "./utils/try-catch";
import { UserState } from "./user";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { connectServer, fetchOthers, updateSelf } from "./network";
import { createResizableCanvas } from "./utils/canvas";
import { getRandomColor } from "./utils/get-random-color";

export async function init() {
  // setup the basic canvas
  const { canvas, context } = createResizableCanvas();

  console.log("connecting...");

  // try connecting to server
  const protocol = window.location.protocol.replace(":", "") as "http"|"https";
  const [socket, err] = await tryCatch(connectServer(protocol));
  if (err) throw "Unable to establish connection: " + err;

  console.log("connected");

  const self: UserState = {
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

  socket.on("user-add", (user:UserState)=> {
    other.set(user.id, user);
    console.log(`user ${user.id} added`);
  });

  // populate the map with users
  const serverSideUsers = await fetchOthers(socket);
  serverSideUsers.forEach((user) => other.set(user.id, user));

  // add the user to the server
  updateSelf(socket, self);

  return { socket, self, other, context, canvas };
}

export function update({
  self,
  other,
  context,
  canvas,
}: Awaited<ReturnType<typeof init>>) {
  // render self
  context.fillStyle = self.color;
  context.fillRect(self.x, self.y, 24, 24);
}
