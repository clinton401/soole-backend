import express, { Request, Response } from 'express';
import cors from "cors";
import {config} from "dotenv";
import path from "node:path"
config()
const app = express();
const PORT = process.env.PORT || 3001;


app.use(
    cors({
      origin: "*", 
      credentials: true, 
    })
  );
  app.use(express.static(path.join(__dirname, '../frontend')));



  app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })