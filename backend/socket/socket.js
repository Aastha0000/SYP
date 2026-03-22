import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinConversation", (conversationId) => {
      socket.join(String(conversationId));
    });

    socket.on("sendMessage", (data) => {
      io.to(String(data.conversationId)).emit("receiveMessage", {
        conversationId: data.conversationId,
        senderId: socket.user.id,
        message: data.message
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};


export default setupSocket;