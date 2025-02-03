import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "dotenv";
import api from "./api";

import { foundError, notFound } from "./controllers/error-controllers";
config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
