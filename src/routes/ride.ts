import { Router } from "express";
import { createRide, searchRides, requestRide, cancelRideDriver, cancelRidePassenger, getRide, acceptRideRequest, rejectRideRequest, getRides, startRide, passengerConfirmCompletion, driverConfirmCompletion } from "../controllers/ride-controller";

const ride = Router();

ride.post("/create", createRide);
ride.get("/search", searchRides);
ride.get("/", getRides);
ride.get("/:id", getRide);
ride.post("/:id/request", requestRide);
ride.post("/:id/request/accept", acceptRideRequest);
ride.post("/:id/request/reject", rejectRideRequest);
ride.post("/:id/cancel/driver", cancelRideDriver);
ride.post("/:id/cancel/passenger", cancelRidePassenger);


ride.post("/:id/start", startRide);
ride.post("/:id/completed/passenger", passengerConfirmCompletion);
ride.post("/:id/completed/driver", driverConfirmCompletion);

export default ride;
