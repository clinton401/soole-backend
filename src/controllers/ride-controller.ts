import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { rideModel } from "../nobox/record-structures/ride";
import { server_error, unknown_error, unauthorized_error } from "../lib/variables";

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
    const validNumberOfSeats = Number(numberOfSeats)
    if (!validNumberOfSeats) return next(createError(400, "Number of seats is required."))

    const ride = await rideModel.insertOne({
      userId,
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      date,
      estimatedTime,
      carImages,
      vehicleModel,
      color,
      plateNumber,
      numberOfSeats: validNumberOfSeats,
      pricePerSeat,
      status: "ACTIVE",
      passengers: []
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
    return next(createError(500, server_error));
  }
};

export const searchRides = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {


  const { from, to, date } = req.query as {
    from: string | null;
    to: string | null;
    date: string | null
  };
  const userId = req.userId;
  if (!userId) {

    res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in to create a ride."
    });
    return;
  }
  if (!from || !to || !date) {
    res.status(400).json({
      success: false,
      message: "Please provide 'from', 'to', and 'date' parameters.",
    });
    return;
  }

  try {
    const rides = await rideModel.find({
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      date: date as string,
      status: "ACTIVE"
    });
    const ridesNotBookedByYou = rides.filter(ride => {
      return !ride.passengers.some(passenger => passenger.id === userId);
    });


    if (ridesNotBookedByYou.length === 0) {

      res.status(404).json({
        success: false,
        message: "No rides found for the given search criteria."
      })
      return;
    }
    const availableRides = ridesNotBookedByYou.filter(ride => {
      return ride.numberOfSeats > 0
    })

    res.status(200).json({
      success: true,
      message: "Rides found successfully.",
      rides: availableRides,
    });
  } catch (error) {
    console.error(`Error while searching for rides: ${error}`);
    next(new Error("Unable to search for rides."));
  }
};


export const cancelRidePassenger = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const id = req.params.id;

  if (!userId) return next(createError(401, unauthorized_error));

  try {
    const ride = await rideModel.findOne({ id });
    if (!ride) return next(createError(404, "Ride not found."));

    const foundPassenger = ride.passengers.find(passenger => passenger.id === userId);
    if (!foundPassenger) {
      return next(createError(400, "You can't cancel this ride because you're not a passenger."));
    }

    const newPassengers = ride.passengers.filter(passenger => passenger.id !== userId);
    const newNoOfSeats = Math.max(ride.numberOfSeats + foundPassenger.seats, 0);

    const updatedRide = await rideModel.updateOneById(ride.id, {
      passengers: newPassengers,
      numberOfSeats: newNoOfSeats,
    });

    if (!updatedRide) {
      return next(createError(500, unknown_error));
    }

    res.status(200).json({
      status: "success",
      message: "Ride successfully cancelled.",
      ride: updatedRide,
    });
  } catch (error) {
    console.error(`Unable to cancel ride as passenger: ${error}`);
    return next(createError(500, server_error));
  }
};


export const cancelRideDriver = async (req: Request, res: Response, next: NextFunction) => {
  const driverId = req.userId;
  const id = req.params.id;
  if (!driverId) return next(createError(401, unauthorized_error));
  try {
    const ride = await rideModel.findOne({ id });
    if (!ride) return next(createError(404, "Ride not found."));
    if (ride.userId !== driverId) return next(createError(400, "You can't cancel this ride because you're not the driver."));
    const updatedRide = await rideModel.updateOneById(ride.id, { status: "CANCELLED" });
    if (!updatedRide) return next(createError(500, unknown_error));
    res.status(200).json({
      status: "success",
      message: "Ride successfully cancelled.",
      ride: updatedRide
    })
  } catch (error) {
    console.error(`Unable to cancel ride as driver: ${error}`);
    return next(createError(500, server_error));
  }

}


export const requestRide = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const userId = req.userId;
  const { seats } = req.body;
  const validSeats = Number(seats);
  if (isNaN(validSeats) || validSeats <= 0) {
    return next(createError(400, "Number of seats is required and must be greater than 0."));
  }

  if (!userId) return next(createError(401, unauthorized_error));
  try {
    const ride = await rideModel.findOne({ id });
    if (!ride) return next(createError(404, "Ride not found."));
    if (ride.userId === userId) return next(createError(400, "You can't request this ride because you're the driver."));
    const amountOfSeatsLeft = ride.numberOfSeats - validSeats;
    if (amountOfSeatsLeft < 0) return next(createError(400, "Requested seats exceed the available seats."))
    const newPassengers = [...ride.passengers, { id: userId, seats: validSeats }]
    const newNoOfSeats = amountOfSeatsLeft;

    const updatedRide = await rideModel.updateOneById(ride.id, {
      passengers: newPassengers,
      numberOfSeats: newNoOfSeats,
    });
    if (!updatedRide) return next(createError(500, unknown_error));
    res.status(200).json({
      status: "success",
      message: "Ride requested successfully.",
      ride: updatedRide
    })
  } catch (error) {
    console.error(`Unable to request ride: ${error}`);
    return next(createError(500, server_error));
  }
}
export const getRide = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  try {
    const ride = await rideModel.findOne({ id });
    if (!ride) return next(createError(404, "Ride not found."));
     res.status(200).json({
      status: "success",
      ride
    })
  } catch (error) {
    console.error(`Unable to get ride: ${error}`);
    return next(createError(500, server_error));
  }
}