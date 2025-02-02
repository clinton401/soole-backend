import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { rideModel } from "../nobox/record-structures/ride";
import { UserModel } from "../nobox/record-structures/user";
import { WalletModel, WalletType } from "../nobox/record-structures/wallet";
import { NotificationModel, NotificationType } from "../nobox/record-structures/notification";
import { server_error, unknown_error, unauthorized_error } from "../lib/variables";
import { PayoutModel, PayoutType, PayoutStatus } from "../nobox/record-structures/payout";
import { findWalletByUserId, payForRide, addToWallet } from "../data/wallet"
import { hasSufficientBalance, hasDecimal } from "../lib/utils"

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
    const validNumberOfSeats = Number(numberOfSeats);
    if (isNaN(validNumberOfSeats) || validNumberOfSeats <= 0) {
      return next(createError(400, "Number of seats is required and must be greater than 0."));
    }
    if (hasDecimal(validNumberOfSeats)) {
            return next(createError(400, "Invalid number of seats: Please enter a whole number without decimals."))
        }
    // if (!validNumberOfSeats) return next(createError(400, "Number of seats is required."))
    // const user = await UserModel.findOne({ id: userId }, {});
    const [user, wallet] = await Promise.all([
      UserModel.findOne({ id: userId }, {}),
      findWalletByUserId(userId, WalletType.DRIVER)
    ])
    if (!user) return next(createError(404, "User not found."));
    if (!wallet) return next(createError(400, "You need to create a driver's wallet before creating a ride."))

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
      passengers: [],
      userAvatarUrl: user.avatarUrl,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      userUsername: user.username,
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

export const getRides = async (req: Request, res: Response, next: NextFunction) => {
  const { filter } = req.query as {
    filter: string
  };

  const validFilters = ['active', 'completed', 'cancelled', "ongoing"];
  const selectedFilter = validFilters.includes(filter?.toLowerCase()) ? filter.toLowerCase() : 'active';

  type Status = "ACTIVE" | "CANCELLED" | "COMPLETED" | "ONGOING"

  const filterVariable = selectedFilter.toUpperCase() as Status;
  const userId = req.userId;
  if (!userId) return next(createError(401, unauthorized_error));;
  try {
    const rides = await rideModel.find({

      status: filterVariable
    }, {
      pagination: {
        limit: 25,
        page: 1,
      }
    });
    res.status(200).json({
      success: true,
      message: "Rides found successfully.",
      rides
    });
  } catch (error) {
    console.error(`Unable to get rides: ${error}`);
    return next(createError(500, server_error))
  }
}

export const cancelRidePassenger = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const id = req.params.id;

  if (!userId) return next(createError(401, unauthorized_error));

  try {
    const [ride, user] = await Promise.all([rideModel.findOne({ id }), UserModel.findOne({ id: userId })]);
    if (!ride) return next(createError(404, "Ride not found."));
    if (!user) return next(createError(404, "User not found."));
    if (ride.status !== "ACTIVE") {
      return next(createError(400, "This ride is not active and cannot be cancelled."))
    }
    const foundPassengers = ride.passengers.filter(passenger => passenger.id === userId);
    if (foundPassengers.length === 0) {
      return next(createError(400, "You can't cancel this ride because you're not a passenger."));
    }
    const wallet = await findWalletByUserId(foundPassengers[0].id)
    if (!wallet) {
      return next(createError(400, "No wallet found for this user"))
    }
   const refundAmount = foundPassengers.reduce((total, passenger) => total + passenger.seats * ride.pricePerSeat, 0);

    // Refund passenger
    const refundSuccess = await addToWallet(wallet.id, refundAmount, wallet.balance);
    if (!refundSuccess) {
      return next(createError(500, unknown_error))
    }


    const newPassengers = ride.passengers.filter(passenger => passenger.id !== userId);
    const totalSeatsToAdd = foundPassengers.reduce((total, passenger) => total + passenger.seats, 0);

    const newNoOfSeats = Math.max(ride.numberOfSeats + totalSeatsToAdd, 0);

    const updatedRide = await rideModel.updateOneById(ride.id, {
      passengers: newPassengers,
      numberOfSeats: newNoOfSeats,
    });

    if (!updatedRide) {
      return next(createError(500, unknown_error));
    }

    await NotificationModel.insertOne({
      userId: ride.userId,
      type: NotificationType.RIDE_CANCELLED_BY_PASSENGER,
      from: ride.from,
      to: ride.to,
      triggeredById: user.id,
      seats: totalSeatsToAdd,
      isRead: false,
      rideId: id,
      triggeredByAvatarUrl: user.avatarUrl as string,
      triggeredByFirstName: user.firstName as string,
      triggeredByLastName: user.lastName as string,
      triggeredByUsername: user.username as string,
    })
    const payouts = await PayoutModel.find({
      userId: ride.userId,
      requesterId: user.id,
      rideId: ride.id

    })
    for (const payout of payouts) {
      await PayoutModel.updateOneById(payout.id, {
        status: PayoutStatus.FAILED
      })
    }


    res.status(200).json({
      status: "success",
      message: "Ride successfully cancelled.",
      ride: updatedRide,
      wallet: refundSuccess
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
    const [ride, driver] = await Promise.all([rideModel.findOne({ id }), UserModel.findOne({ id: driverId })]);
    if (!ride) return next(createError(404, "Ride not found."));
    if (!driver) return next(createError(404, "User not found."));
    if (ride.status !== "ACTIVE") {
      return next(createError(400, "This ride is not active and cannot be cancelled."))
    }
    if (ride.userId !== driverId) return next(createError(400, "You can't cancel this ride because you're not the driver."));

    const updatedRide = await rideModel.updateOneById(ride.id, { status: "CANCELLED" });
    if (!updatedRide) return next(createError(500, unknown_error));
    for (const passenger of ride.passengers) {
      try {
        const wallet = await findWalletByUserId(passenger.id)
        if (wallet) {
          const refundAmount = passenger.seats * ride.pricePerSeat;

          // Refund passenger
          const refundSuccess = await addToWallet(wallet.id, refundAmount, wallet.balance);
          if (!refundSuccess) {
            console.error(`Failed to refund user ${passenger.id}`);
            continue;
          }
        }
        await NotificationModel.insertOne({
          userId: passenger.id,
          type: NotificationType.RIDE_CANCELLED_BY_DRIVER,
          from: ride.from,
          to: ride.to,
          triggeredById: driverId,
          seats: passenger.seats,
          isRead: false,
          rideId: id,
          triggeredByAvatarUrl: driver.avatarUrl as string,
          triggeredByFirstName: driver.firstName as string,
          triggeredByLastName: driver.lastName as string,
          triggeredByUsername: driver.username as string,
        })
        const payouts = await PayoutModel.find({
          userId: driverId,
          requesterId: passenger.id,
          rideId: ride.id

        })
        for (const payout of payouts) {
          await PayoutModel.updateOneById(payout.id, {
            status: PayoutStatus.FAILED
          })
        }


      } catch (error) {
        console.error(`Error processing passenger ${passenger.id}:`, error);

      }
    }
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
  if (hasDecimal(validSeats)) {
    return next(createError(400, "Invalid number of seats: Please enter a whole number without decimals."))
}

  if (!userId) return next(createError(401, unauthorized_error));
  try {
    const [user, ride, wallet] = await Promise.all([
      UserModel.findOne({ id: userId }, {}),
      rideModel.findOne({ id }, {}),
      findWalletByUserId(userId)
    ]);
    // const ride = await rideModel.findOne({ id });
    if (!user) return next(createError(404, "User not found."))
    if (!ride) return next(createError(404, "Ride not found."));
    if (ride.status !== "ACTIVE") {
      return next(createError(400, "This ride is not active and cannot be requested."))
    }
    if (!wallet) return next(createError(400, "You need to create a wallet before requesting a ride."))
    if (ride.userId === userId) return next(createError(400, "You can't request this ride because you're the driver."));
    const amountOfSeatsLeft = ride.numberOfSeats - validSeats;
    if (amountOfSeatsLeft < 0) return next(createError(400, "Requested seats exceed the available seats."));
    const rideCost = ride.pricePerSeat * validSeats;
    const isSufficient = hasSufficientBalance(wallet.balance, rideCost);
    if (!isSufficient) {
      return next(createError(400, "Insufficient balance. Please fund your wallet."))
    }

    const params = {
      userId: ride.userId,
      type: NotificationType.RIDE_REQUEST,
      from: ride.from,
      to: ride.to,
      triggeredById: userId,
      seats: validSeats,
      isRead: false,
      rideId: id,
      triggeredByAvatarUrl: user.avatarUrl as string,
      triggeredByFirstName: user.firstName as string,
      triggeredByLastName: user.lastName as string,
      triggeredByUsername: user.username as string,
    }
    const existingRequest = await NotificationModel.findOne({
      userId: ride.userId,
      type: NotificationType.RIDE_REQUEST,
      triggeredById: userId,
      from: ride.from,
      to: ride.to,
      rideId: id
    }, {});
    if (existingRequest) return next(createError(400, "You have already requested this ride. Please wait for the driver's response."));
    const newNotification = await NotificationModel.insertOne(params);
    if (!newNotification) {
      return next(createError(500, unknown_error))
    }
    await payForRide(wallet.id, rideCost, wallet.balance);
    const userName = `${user.firstName} ${user.lastName}`
    const payout = await PayoutModel.insertOne({
      userId: ride.userId,
      requesterId: userId,
      pickupLocation: ride.from,
      dropoffLocation: ride.to,
      amount: rideCost,
      userName,
      rideId: ride.id,
      status: PayoutStatus.PENDING,
      type: PayoutType.RIDE_PAYMENT
    })
    if (!payout) {
      return next(createError(500, unknown_error));
    }
    res.status(200).json({
      status: "success",
      message: "Ride request sent successfully. You will be notified once the driver responds.",
      // ride: updatedRide
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

export const acceptRideRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { passengerId, notificationId } = req.body;
  const driverId = req.userId;
  const rideId = req.params.id;

  if (!driverId) return next(createError(401, unauthorized_error));
  if (!passengerId || !notificationId) return next(createError(400, "The 'passengerId'  and 'notificationId' field is required in the request body."))
  try {
    const [notification, passenger, driver, ride] = await Promise.all([
      NotificationModel.findOne({ id: notificationId }, {}),
      UserModel.findOne({ id: passengerId }, {}),
      UserModel.findOne({ id: driverId }, {}),
      rideModel.findOne({ id: rideId }, {}),
    ]);
    if (!notification) return next(createError(404, "Notification not found."));
    if (!passenger) return next(createError(404, "Passenger not found."));
    if (!driver) return next(createError(404, "Driver not found."));
    if (!ride) return next(createError(404, "Ride not found."));
    if (ride.status !== "ACTIVE") {
      return next(createError(400, "You can only accept requests for active rides."))
    }
    if (notification.type !== NotificationType.RIDE_REQUEST) {
      return next(createError(400, "You can only accept  notifications of type 'RIDE_REQUEST'."));
    }
    if (ride.userId !== driverId) return next(createError(403, "You can't accept this ride because you're not the driver."));
    const validSeats = notification.seats;
    const amountOfSeatsLeft = ride.numberOfSeats - validSeats;
    if (amountOfSeatsLeft < 0) return next(createError(400, "Requested seats exceed the available seats."));
    const newPassengers = [...ride.passengers, {
      id: passengerId, seats: validSeats,
      completed: false
    }]
    const newNoOfSeats = amountOfSeatsLeft;

    const updatedRide = await rideModel.updateOneById(ride.id, {
      passengers: newPassengers,
      numberOfSeats: newNoOfSeats,
    });
    if (!updatedRide) return next(createError(500, unknown_error));



    const newNotification = await NotificationModel.insertOne({
      userId: passengerId,
      type: NotificationType.RIDE_ACCEPTED,
      from: notification.from,
      to: notification.to,
      triggeredById: driverId,
      seats: notification.seats,
      isRead: false,
      rideId,
      triggeredByAvatarUrl: driver.avatarUrl as string,
      triggeredByFirstName: driver.firstName as string,
      triggeredByLastName: driver.lastName as string,
      triggeredByUsername: driver.username as string,

    });
    if (!newNotification) {
      return next(createError(500, unknown_error))
    };

    await NotificationModel.deleteOneById(notification.id);
    res.status(200).json({
      status: "success",
      message: "Ride accepted successfully.",
    })
  } catch (error) {
    console.error(`Unable to accept ride request: ${error}`)
    return next(createError(500, server_error));
  }
}

export const rejectRideRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { notificationId, passengerId } = req.body;
  const driverId = req.userId;
  const rideId = req.params.id;

  if (!driverId) return next(createError(401, unauthorized_error));
  if (!passengerId || !notificationId) return next(createError(400, "The 'passengerId'  and 'notificationId' field is required in the request body."))
  try {
    const [notification, ride, driver] = await Promise.all([
      NotificationModel.findOne({ id: notificationId }, {}),
      rideModel.findOne({ id: rideId }, {}),
      UserModel.findOne({ id: driverId }, {})
    ]);
    if (!notification) return next(createError(404, "Notification not found."));
    if (!ride) return next(createError(404, "Ride not found."));
    if (!driver) return next(createError(404, "Driver not found."));
    if (ride.status !== "ACTIVE") {
      return next(createError(400, "You can only reject requests for active rides."))
    }
    if (notification.type !== NotificationType.RIDE_REQUEST) {
      return next(createError(400, "You can only reject  notifications of type 'RIDE_REQUEST'."));
    }
    if (ride.userId !== driverId) return next(createError(403, "You can't reject this ride because you're not the driver."));
    
    const wallet = await findWalletByUserId(notification.triggeredById)
    if (!wallet) {
      return next(createError(400, "No wallet found for this user"))
    }
    const refundAmount = notification.seats * ride.pricePerSeat;

    // Refund passenger
    const refundSuccess = await addToWallet(wallet.id, refundAmount, wallet.balance);
    if (!refundSuccess) {
      return next(createError(500, unknown_error))
    }
    const newNotification = await NotificationModel.insertOne({
      userId: passengerId,
      type: NotificationType.RIDE_REJECTED,
      from: notification.from,
      to: notification.to,
      triggeredById: driverId,
      seats: notification.seats,
      isRead: false,
      rideId,
      triggeredByAvatarUrl: driver.avatarUrl as string,
      triggeredByFirstName: driver.firstName as string,
      triggeredByLastName: driver.lastName as string,
      triggeredByUsername: driver.username as string,

    })
    if (!newNotification) {
      return next(createError(500, unknown_error))
    }
    const payouts = await PayoutModel.find({
      userId: ride.userId,
      requesterId: notification.triggeredById,
      rideId: ride.id

    })
    for (const payout of payouts) {
      await PayoutModel.updateOneById(payout.id, {
        status: PayoutStatus.FAILED
      })
    }
    await NotificationModel.deleteOneById(notification.id);
    res.status(200).json({
      status: "success",
      message: "Ride rejected successfully.",
    })

  } catch (error) {
    console.error(`Unable to reject ride request: ${error}`)
    return next(createError(500, server_error));
  }
}

export const startRide = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const driverId = req.userId;
  if (!driverId) {
    return next(createError(401, unauthorized_error))
  }

  try {
    const [ride, driver] = await Promise.all([rideModel.findOne({ id }), UserModel.findOne({ id: driverId })]);
    if (!ride) {
      return next(createError(404, "Ride not found."))
    }
    if (!driver) {
      return next(createError(404, "User not found."))
    }
    if (ride.userId !== driverId) {
      return next(createError(403, "You can't start this ride because you're not the driver."));
    }
    if (ride.status !== "ACTIVE") {
      return next(createError(400,
        "This ride is not active and cannot be started."))
    }


    const updatedRide = await rideModel.updateOneById(ride.id, {
      status: "ONGOING"
    });
    if (!updatedRide) {
      return next(createError(500, unknown_error))
    }
    for (const passenger of ride.passengers) {
      try {

        await NotificationModel.insertOne({
          userId: passenger.id,
          type: NotificationType.RIDE_STARTED,
          from: ride.from,
          to: ride.to,
          triggeredById: driverId,
          seats: passenger.seats,
          isRead: false,
          rideId: id,
          triggeredByAvatarUrl: driver.avatarUrl as string,
          triggeredByFirstName: driver.firstName as string,
          triggeredByLastName: driver.lastName as string,
          triggeredByUsername: driver.username as string,
        })



      } catch (error) {
        console.error(`Error processing passenger ${passenger.id}:`, error);

      }
    }
    res.json({
      status: "success",
      message: "Ride started successfully",
      ride: updatedRide
    })
  } catch (error) {
    console.error(`Unable to start ride: ${error}`)

    return next(createError(500, server_error))
  }
}

export const passengerConfirmCompletion = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const userId = req.userId;
  if (!userId) {
    return next(createError(401, unauthorized_error))
  }
  try {
    const [ride, user] = await Promise.all([rideModel.findOne({ id }), UserModel.findOne({ id: userId })]);
    if (!ride) {
      return next(createError(404, "Ride not found."))
    }
    if (!user) {
      return next(createError(404, "User not found."))
    }
    if (ride.status !== "COMPLETED") {
      return next(createError(400, "You can only confirm completion for a ride that has been marked as completed by the driver."));
    }
    
    const wallet = await findWalletByUserId(ride.userId, WalletType.DRIVER);
    if (!wallet) {
      return next(createError(404, "No wallet found for the driver"))
    }
    const foundPassengers = ride.passengers.filter(passenger => passenger.id === userId);
    if (foundPassengers.length === 0) {
      return next(createError(400, "You can't cancel this ride because you're not a passenger."));
    }
    const isMarkedAsCompleted = foundPassengers.every(passenger => passenger.completed === true)
    if (isMarkedAsCompleted) {
      return next(createError(400,
        "You have already marked this ride as completed."))
    }
    const updatedPassengers = ride.passengers.map(passenger => {
      return passenger.id === userId ? { ...passenger, completed: true } : passenger
    })

    const updatedRide = await rideModel.updateOneById(ride.id, {
      passengers: updatedPassengers
    });
    if (!updatedRide) {
      return next(createError(500, unknown_error))
    }
    const allCompleted = updatedRide.passengers.every(passenger => passenger.completed === true);
    if (allCompleted) {
      let totalPrice = 0;
      updatedRide.passengers.forEach(passenger => {
        totalPrice += passenger.seats * ride.pricePerSeat;
      });
      await addToWallet(wallet.id, totalPrice, wallet.balance);
      await NotificationModel.insertOne({
        userId: ride.userId,
        type: NotificationType.RIDE_COMPLETETED_DRIVER,
        from: ride.from,
        to: ride.to,
        triggeredById: userId,
        seats: ride.numberOfSeats,
        isRead: false,
        rideId: id,
        triggeredByAvatarUrl: user.avatarUrl as string,
        triggeredByFirstName: user.firstName as string,
        triggeredByLastName: user.lastName as string,
        triggeredByUsername: user.username as string,
      })
      const payouts = await PayoutModel.find({
        userId: ride.userId,
        requesterId: user.id,
        rideId: ride.id
  
      })
      for (const payout of payouts) {
        await PayoutModel.updateOneById(payout.id, {
          status: PayoutStatus.SUCCESSFUL
        })
      }

    }

    res.json({
      status: "success",
      message: "Ride marked as completed successfully",
      ride: updatedRide
    })

  } catch (error) {
    console.error(`Unable to complete ride as passenger: ${error}`);
    return next(createError(500, server_error))
  }
}

export const driverConfirmCompletion = async (req: Request, res: Response, next: NextFunction) => {
  const driverId = req.userId;
  const id = req.params.id
  if (!driverId) {
    next(createError(401, unauthorized_error))
  }
  try {
    const [ride, driver] = await Promise.all([rideModel.findOne({ id }), UserModel.findOne({ id: driverId })]);
    if (!ride) {
      return next(createError(404, "Ride not found."))
    }
    if (!driver) {
      return next(createError(404, "User not found."))
    }
    if (ride.status !== "ONGOING") {
      return next(createError(400,
        "You can only confirm completion for an ongoing ride."))
    }
    if (ride.userId !== driverId) return next(createError(400, "You can't mark this as completed ride because you're not the driver."));

    const updatedRide = await rideModel.updateOneById(ride.id, {
      status: "COMPLETED"
    })
    if (!updatedRide) {
      return next(createError(500, unknown_error))
    }
    for (const passenger of ride.passengers) {
      try {

        await NotificationModel.insertOne({
          userId: passenger.id,
          type: NotificationType.RIDE_COMPLETETED_PASSENGER,
          from: ride.from,
          to: ride.to,
          triggeredById: driverId,
          seats: passenger.seats,
          isRead: false,
          rideId: id,
          triggeredByAvatarUrl: driver.avatarUrl as string,
          triggeredByFirstName: driver.firstName as string,
          triggeredByLastName: driver.lastName as string,
          triggeredByUsername: driver.username as string,
        })



      } catch (error) {
        console.error(`Error processing passenger ${passenger.id}:`, error);

      }
    }
    res.json({
      status: "success",
      message: "Ride marked as completed successfully. You will receive your payment once all passengers confirm the ride completion.",
      ride: updatedRide
    })
  } catch (error) {
    console.error(`Unable to complete ride as driver: ${error}`);
    return next(createError(500, server_error))
  }
}