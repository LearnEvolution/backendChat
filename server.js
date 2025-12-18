import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = [];

io.on("connection", (socket) => {
  socket.on("join", (name) => {
    if (!onlineUsers.includes(name)) {
      onlineUsers.push(name);
    }
    io.emit("onlineUsers", onlineUsers);
  });

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(u => u !== socket.id);
    io.emit("onlineUsers", onlineUsers);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
