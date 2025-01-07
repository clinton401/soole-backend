import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { rideModel } from "../nobox/record-structures/ride";

export const createRide = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      from,
      to,
      date,
      estimatedTime,
      carImages,
      vehicleModel,
      color,
      plateNumber,
      numberOfSeats,
      pricePerSeat,
    } = req.body;

    if (!from || !to) {
      return next(
        createError(400, "Both 'from' and 'to' locations are required.")
      );
    }

    const userId = req.userId;
    if (!userId) {
      return next(
        createError(401, "Unauthorized. Please log in to create a ride.")
      );
    }

    const ride = await rideModel.insertOne({
      userId,
      from,
      to,
      date,
      estimatedTime,
      carImages,
      vehicleModel,
      color,
      plateNumber,
      numberOfSeats,
      pricePerSeat,
    });

    if (!ride) {
      return next(createError(500, "Failed to create the ride."));
    }

    res.status(201).json({
      success: true,
      message: "Ride created successfully.",
      data: ride,
    });
  } catch (error) {
    console.error("Error creating ride:", error);
    return next(createError(500, "Internal server error."));
  }
};

export const searchRides = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    res.status(400).json({
      success: false,
      message: "Please provide 'from', 'to', and 'date' parameters.",
    });
    return;
  }

  try {
    const rides = await rideModel.find({
      from: from as string,
      to: to as string,
      date: date as string,
    });

    if (rides.length === 0) {
      res.status(404).json({
        success: false,
        message: "No rides found for the given search criteria.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Rides found successfully.",
      rides,
    });
  } catch (error) {
    console.error(`Error while searching for rides: ${error}`);
    next(new Error("Unable to search for rides."));
  }
};
