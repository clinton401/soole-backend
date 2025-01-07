import { Router } from "express";
import { createRide, searchRides, requestRide , cancelRideDriver, cancelRidePassenger, getRide} from "../controllers/ride-controller";

const ride = Router();

ride.post("/create", createRide);
ride.get("/search", searchRides);
ride.get("/:id", getRide)
ride.post("/:id/request", requestRide);
ride.post("/:id/cancel/driver", cancelRideDriver);
ride.post("/:id/cancel/passenger", cancelRidePassenger);

export default ride;
