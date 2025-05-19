import { io, Socket } from "socket.io-client";
import { UserState } from "./user";

export async function connectServer(protocol: "https" | "http" = "http"): Promise<Socket> {
  // const socket = io("https://server-chocopie.digital:5555");
  const host = "localhost";
  const port = 5555;

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


export function updateSelf(socket: Socket, user: Partial<UserState>) {
  socket.emit("user-update", user);
}

export async function fetchOthers(socket: Socket): Promise<UserState[]> {
  return new Promise<UserState[]>((resolve) => {
    socket.emit("fetch-others", resolve);
  });
}
