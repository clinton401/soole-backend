import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";
import auth from "./routes/auth";
import ride from "./routes/ride";
import user from "./routes/user";
import { foundError, notFound } from "./controllers/error-controllers";
import {
  isAuthenticated,
  verifyAccessToken,
} from "./middlewares/access-tokens";
import {uploadImage} from "./controllers/auth-controllers";
import upload from "./middlewares/upload"
import createHardcodedUser from "./init";

config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.set("trust proxy", 1);
// createHardcodedUser();
// app.use(express.static(path.join(__dirname, '../frontend')));

app.use("/api/auth", isAuthenticated, auth);
app.use("/api/rides", verifyAccessToken, ride);
app.use("/api/user", verifyAccessToken, user);




app.get("/",  (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the Soole backend" });
});
app.post("/api/upload-images",upload.single('image'),  uploadImage)
app.all("*", notFound);
app.use(foundError);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
