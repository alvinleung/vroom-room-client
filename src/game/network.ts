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
    //TODO: handle scenario when the network needs to reconnect
    socket.on("connect", () => {
      accept(socket);
    });
    socket.on("connect_error", (err) => {
      reject(err);
    });
  });
}

export type SharedState<T> = T & { _mutatedLocally?: boolean };
export namespace StateSync {
  export function markNeedUpdate<T>(state: SharedState<T>) {
    state._mutatedLocally = true;
  }

  interface StateMutation<T> {
    time: number;
    action: "add" | "remove" | "update";
    value: T;
  }

  export async function createMutationQueue(socket: Socket) {
    // Buffer that saves unsynced states
    let mutationQueue: StateMutation<UserState>[] = [];

    socket.on("user-add", (user: UserState) => {
      mutationQueue.push({
        time: performance.now(),
        action: "add",
        value: user,
      });
    });

    socket.on("user-delete", (user: UserState) => {
      mutationQueue.push({
        time: performance.now(),
        action: "remove",
        value: user,
      });
    });

    socket.on("user-update", (user: UserState) => {
      console.log("update", user);
      mutationQueue.push({
        time: performance.now(),
        action: "update",
        value: user,
      });
    });

    return mutationQueue;
  }

  const THROTTLE = 1000 / 30;
  let lastUpdate = performance.now();

  export function emitLocalMutations(
    socket: Socket,
    allUsers: Map<string, SharedState<UserState>>,
  ) {
    allUsers.forEach((user) => {
      if (!user._mutatedLocally) return;

      const now = performance.now();
      if (now - lastUpdate < THROTTLE) {
        // ignore update
        return false;
      }
      lastUpdate = now;

      //strip the mutation state
      const updatedUserState = { ...user };
      delete updatedUserState._mutatedLocally;
      socket.emit("emit-user-update", updatedUserState);

      user._mutatedLocally = false;
    });
  }

  export function applyIncomingMutations(
    socket: Socket,
    other: Map<string, UserState>,
    incomingStateQueue: StateMutation<UserState>[],
  ) {
    // process incoming states here captured by the socket event
    for (let i = 0; i < incomingStateQueue.length; i++) {
      const mutation = incomingStateQueue[i];
      const user = mutation.value;

      switch (mutation.action) {
        case "add":
          other.set(user.id, user);
          break;

        case "remove":
          other.delete(user.id);
          break;

        case "update":
          const targetUser = other.get(user.id);
          if (!targetUser) {
            console.warn(
              "attempting to update non-existant user",
              user.id,
              ", could be a bug.",
            );
            return;
          }

          Object.assign(targetUser, user);
          break;
      }
    }
    // clear the queue after processing all mutations
    incomingStateQueue.length = 0;
  }

  export async function fetchWorld(socket: Socket): Promise<UserState[]> {
    return new Promise<UserState[]>((resolve) => {
      // potentially create a timeout for this
      socket.emit("fetch-world", resolve);
    });
  }
}
