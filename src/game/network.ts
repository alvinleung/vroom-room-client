import { io, Socket } from "socket.io-client";
import { UserState } from "./user";

export async function connectServer(): Promise<Socket> {
  // const socket = io("https://server-chocopie.digital:5555");
  // const host = "localhost";
  // const port = 5555;

  const isProd = window.location.hostname !== "localhost";
  const protocol = window.location.protocol.replace(":", "") as
    | "http"
    | "https";
  const port = 5555;
  const host = isProd ? "server-chocopie.digital" : "localhost";

  const connectionUrl = `${protocol}://${host}:${port}`;
  const socket = io(connectionUrl);

  return new Promise((accept, reject) => {
    socket.on("connect", () => {
      accept(socket);
    });
    socket.on("connect_error", (err) => {
      reject(err);
    });
  });
}

export async function fetchOthers(socket: Socket): Promise<UserState[]> {
  return new Promise<UserState[]>((resolve) => {
    socket.emit("fetch-others", resolve);
  });
}

export type SharedState<T> = T & {
  _dirty?: boolean;
};

export function markDirty<T>(state: SharedState<T>) {
  state._dirty = true;
}

let lastUpdate = performance.now();
export function emitUserStateThrottled(
  socket: Socket,
  user: SharedState<UserState>,
  // update freaquency 60 fps
  throttle: number = 1000 / 60,
) {
  const now = performance.now();
  if (now - lastUpdate < throttle) {
    // ignore update
    return false;
  }

  lastUpdate = now;

  socket.emit("emit-user-update", user);
  user._dirty = false;

  return true;
}
