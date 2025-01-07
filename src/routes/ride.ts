import { Router } from "express";
import { createRide, searchRides } from "../controllers/ride-controller";

const ride = Router();

ride.post("/create", createRide);
ride.get("/search", searchRides);

export default ride;
