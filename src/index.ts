import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "dotenv";
import api from "./api";
import {createServer} from "http";
import { Server, Socket } from 'socket.io';
import { foundError, notFound } from "./controllers/error-controllers";
config();
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
export const io = new Server(server, {
  cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
  });
});

app.use(express.json({ verify: (req: Request, res, buf) => { req.rawBody = buf.toString(); } }));
app.set("trust proxy", 1);
// createHardcodedUser();
// app.use(express.static(path.join(__dirname, '../frontend')));

app.use("/api", api)



app.get("/",  (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the Soole backend" });
});

app.all("*", notFound);
app.use(foundError);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
