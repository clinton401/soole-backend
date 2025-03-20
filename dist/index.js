"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const api_1 = __importDefault(require("./api"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const error_controllers_1 = require("./controllers/error-controllers");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://soole-admin.vercel.app", "https://soole-waitlist.vercel.app"],
    credentials: true,
}));
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://soole-admin.vercel.app"],
        methods: ["GET", "POST"]
    }
});
exports.io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
app.use(express_1.default.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }));
app.set("trust proxy", 1);
// createHardcodedUser();
// app.use(express.static(path.join(__dirname, '../frontend')));
app.use("/api", api_1.default);
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Soole backend" });
});
app.all("*", error_controllers_1.notFound);
app.use(error_controllers_1.foundError);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
