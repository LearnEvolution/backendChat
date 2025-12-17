import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ====== MONGODB ======
const mongoUrl =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/chat2";

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🔥 MongoDB conectado"))
  .catch((err) => console.log("❌ Erro MongoDB:", err));

// ====== SOCKET ======
let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("🔥 Usuário conectado");

  socket.on("join", (name) => {
    onlineUsers.push(name);
    io.emit("onlineUsers", onlineUsers);
  });

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Usuário desconectado");
  });
});

// ====== ROTAS ======
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
