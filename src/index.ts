import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";
import auth from "./routes/auth";
import ride from "./routes/ride";
import { foundError, notFound } from "./controllers/error-controllers";
import {
  isAuthenticated,
  verifyAccessToken,
} from "./middlewares/access-tokens";
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

app.get("/api/protected", verifyAccessToken, (req: Request, res: Response) => {
  res.status(200).json({
    message: `Welcome to protected route: ${req?.userId}`,
  });
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the Soole backend" });
});
app.all("*", notFound);
app.use(foundError);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
