import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let onlineUsers = [];
let messages = [];

io.on("connection", (socket) => {

    socket.on("userOnline", (user) => {

        const exists = onlineUsers.find(u => u.email === user.email);

        if (!exists) {
            onlineUsers.push({ email: user.email });
        }

        io.emit("onlineUsers", onlineUsers);
    });

    socket.on("chatMessage", (msg) => {
        messages.push(msg);
        io.emit("chatMessage", msg);
    });

    socket.on("disconnect", () => {
        io.emit("onlineUsers", onlineUsers);
    });
});


app.get("/", (req, res) => {
    res.send("API RUNNING ✅");
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log("🔥 Servidor online porta " + PORT);
});
