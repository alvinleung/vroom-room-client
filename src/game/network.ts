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

interface StateMutation<T> {
  time: number;
  action: "add" | "remove" | "update";
  value: T;
}

export async function initNetworkState(
  socket: Socket,
  other: Map<string, UserState>,
) {
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
    mutationQueue.push({
      time: performance.now(),
      action: "update",
      value: user,
    });
  });

  // populate the map with initial state
  const serverSideUsers = await fetchOthers(socket);
  serverSideUsers.forEach((user) => {
    other.set(user.id, user);
  });

  return mutationQueue;
}

export function syncNetworkState(
  socket: Socket,
  localState: {
    self: SharedState<UserState>;
    other: Map<string, UserState>;
  },
  incomingStateQueue: StateMutation<UserState>[],
) {
  const { self, other } = localState;

  // upload user state if it were mutated
  if (self._mutatedLocally) {
    emitUserStateThrottled(socket, self, 1000 / 30);
  }

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
}

export async function fetchOthers(socket: Socket): Promise<UserState[]> {
  return new Promise<UserState[]>((resolve) => {
    socket.emit("fetch-world", resolve);
  });
}

// SHARED STATE UPDATE
export type SharedState<T> = T & {
  _mutatedLocally?: boolean;
};

export function markNeedUpdate<T>(state: SharedState<T>) {
  state._mutatedLocally = true;
}

let lastUpdate = performance.now();
function emitUserStateThrottled(
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
  user._mutatedLocally = false;

  return true;
}
