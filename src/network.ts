import { io, Socket } from "socket.io-client";
import { UserState } from "./user";

export async function connectServer(): Promise<Socket> {
  const socket = io("https://server-chocopie.digital:5555");
  // const socket = io("https://127.0.0.1:5555");
  return new Promise((accept, reject) => {
    socket.on("connect", () => {
      accept(socket);
    });
    socket.on("connect_error", (err) => {
      reject(err);
    });
  });
}

export function updateSelf(socket: Socket, user: Partial<UserState>) {
  socket.emit("user-state-update", user);
}

export async function fetchOthers(socket: Socket): Promise<UserState[]> {
  return new Promise<UserState[]>((resolve, reject) => {
    socket.emit("fetch-others", resolve);
  });
}
