import { Server } from "socket.io";
import { ORIGIN } from "../config/index.js";

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: ORIGIN },
    transports: ["websocket"],
    allowUpgrades: false
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}

export function emit(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}
