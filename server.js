import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api/users", userRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 🔥 usuários conectados
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("Conectado:", socket.id);

  // quando entra no chat
  socket.on("join", (user) => {
    onlineUsers[socket.id] = user;
    io.emit("onlineUsers", Object.values(onlineUsers));
  });

  // mensagens
  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });

  // quando sai
  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("onlineUsers", Object.values(onlineUsers));
    console.log("Desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🔥 Backend rodando na porta ${PORT}`);
});
