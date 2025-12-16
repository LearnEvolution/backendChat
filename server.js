import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

const app = express();

/* 🔥 PORTA DINÂMICA (Render usa isso) */
const PORT = process.env.PORT || 3001;

/* 🔥 CORS liberado (depois ajustamos para Vercel) */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());
app.use("/api/users", userRoutes);

/* 🔥 servidor HTTP separado */
const server = http.createServer(app);

/* 🔥 socket.io preparado para produção */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* ================= SOCKET ================= */

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

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
    console.log("Usuário desconectado:", socket.id);
  });
});

/* ================= START ================= */

server.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
