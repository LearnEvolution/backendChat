import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

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

let users = [];

io.on("connection", (socket) => {

  socket.on("user_connected", (user) => {
    const exists = users.find(u => u.id === user.id);
    if (!exists) {
      users.push({
        socketId: socket.id,
        name: user.name,
        id: user.id
      });
    }

    io.emit("online_users", users);
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    users = users.filter(u => u.socketId !== socket.id);
    io.emit("online_users", users);
  });
});

app.get("/", (req, res) => {
  res.send("Servidor rodando!");
});

server.listen(3001, () => {
  console.log("Server ON - Porta 3001");
});
