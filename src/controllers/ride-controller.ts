import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { rideModel, Ride } from "../nobox/record-structures/ride";
import { UserModel } from "../nobox/record-structures/user";
import { WalletModel, WalletType } from "../nobox/record-structures/wallet";
import { NotificationModel, NotificationType } from "../nobox/record-structures/notification";
import { server_error, unknown_error, unauthorized_error } from "../lib/variables";
import { PayoutModel, PayoutType, PayoutStatus } from "../nobox/record-structures/payout";
import { findWalletByUserId, deductFromWallet, addToWallet } from "../data/wallet"
import { createNotification } from "../data/notification"
import { hasSufficientBalance, hasDecimal, dateToInt, getUserPageInfo, isWithinTwoDays, isPastDate } from "../lib/utils";
import {RidePassengerModel, RidePassenger} from "../nobox/record-structures/ride-passenger";
import { TransactionModel, TransactionType, TransactionStatus } from "../nobox/record-structures/transaction";
import {io} from ".."


export const createRide = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
    if (!userId) {
      return next(
        createError(401, "Unauthorized. Please log in to create a ride.")
      );
    }
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
    const inputDate = new Date(date);
  
  
    if (isNaN(inputDate.getTime())) {
      return next(createError(400, "Invalid date format provided."));
    }
    if(isPastDate(inputDate)) {
      return next(createError(400, "Invalid date! Please enter a date that is today or in the future."));
    }
    if(!carImages || carImages.length !== 3) {
      return next(createError(400, "Car images are required and must be of length 3"))
    }
    if (!carImages.every((img: any) => typeof img === "string" && img.trim() !== "")) {
      return next(createError(400, "Invalid input: All image URLs must be valid non-empty strings."));
      
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
    const user = await UserModel.findOne({ id: userId }, {});
    if (!user) return next(createError(404, "User not found."));
    // if (!wallet) return next(createError(400, "You need to create a driver's wallet before creating a ride."))
    if(!user.driverLicense) {
      return next(createError(400, "Driver's license is required to create a ride."))
    }
      const today = new Date();
    // today.setDate(today.getDate() - 1);
    const analyticsDate = dateToInt(today);
    const ride = await rideModel.insertOne({
      userId,
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      date: inputDate.toISOString(),
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
      userEmail: user.email,
      adminViewable: true,
      analyticsDate
    });
    if (!ride) {
      return next(createError(500, "Failed to create the ride."));
    }
    io.emit("ride", {...ride, createdAt: new Date().toISOString()})
    const totalRides = user.totalRides ? user.totalRides + 1 : 1;
    await UserModel.updateOneById(user.id, {
      totalRides
    })
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


  const { from, to, date, page } = req.query as {
    from: string | null;
    to: string | null;
    date: string | null;
    page: string | null;
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
  const requestDate = new Date(date);
  
  
  if (isNaN(requestDate.getTime())) {
    return next(createError(400, "Invalid date format provided."));
  }

  // const currentPage = Math.max(1, Number(page) || 1);
  try {
    const rides = await rideModel.find({
      status: "ACTIVE"
    });

    // const rideNotCreatedByYou = rides.filter(ride => ride.userId !== userId);
    const ridesNotBookedByYou = rides.filter(ride => {
      return !ride.passengers.some(passenger => passenger.id === userId);
    });


    // if (ridesNotBookedByYou.length === 0) {

    //   res.status(404).json({
    //     success: false,
    //     message: "No rides found for the given search criteria."
    //   })
    //   return;
    // }
    const availableRides = ridesNotBookedByYou.filter(ride => {
      return ride.numberOfSeats > 0 &&  (ride.from.toLowerCase().includes(from.trim().toLowerCase()) || 
      ride.to.toLowerCase().includes(to.trim().toLowerCase())) && isWithinTwoDays(ride.date, requestDate)
    
    })
    const pageSize = 50;
// const data = getUserPageInfo(availableRides, pageSize, currentPage, "rides")

    res.status(200).json({
      success: true,
      message: "Rides found successfully.",
      rides: availableRides.slice(0, pageSize)
    });
  } catch (error) {
    console.error(`Error while searching for rides: ${error}`);
    next(new Error("Unable to search for rides."));
  }
};

export const getRides = async (req: Request, res: Response, next: NextFunction) => {
  const { filter, role, page } = req.query as {
    filter: string;
    role?: string;
    page?: string;
  };

  const validFilters = ['active', 'completed', 'cancelled', "ongoing"];
  const selectedFilter = validFilters.includes(filter?.toLowerCase()) ? filter.toLowerCase() : 'active';

  type Status = "ACTIVE" | "CANCELLED" | "COMPLETED" | "ONGOING"

  const filterVariable = selectedFilter.toUpperCase() as Status;
  const userId = req.userId;
  if (!userId) return next(createError(401, unauthorized_error));

  const validRole: "driver" | "passenger" =  role && role.toLowerCase() === "driver" ? "driver" : "passenger";
  // console.log({role, validRole}) 
  const currentPage = Math.max(1, Number(page) || 1);
  try {

    let rides: Ride[] | RidePassenger[] | null;
    if(validRole === "driver"){
      const [requestedRides, ongoingRides] = await Promise.all([
        rideModel.find({

          status: filterVariable,
          userId
        }),
        rideModel.find({

          status: "ONGOING",
          userId
        }),

      ])
    //  rides = await rideModel.find({

    //   status: filterVariable,
    //   userId
    // });
    const mergedArray = filterVariable === "ACTIVE" 
    ? [...requestedRides, ...ongoingRides] 
    : [...requestedRides];
    rides =  mergedArray.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else {

    rides = await RidePassengerModel.find({status: filterVariable, userId})
  }
  if(!rides) {
    return next(createError(500, unknown_error));
  }

  
  const pageSize = 15
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const futureRides = rides.filter((ride) => {
      const rideDate = new Date(ride.date);
      rideDate.setHours(0, 0, 0, 0); 
      return rideDate >= today;
    });
    const data = getUserPageInfo(futureRides, pageSize, currentPage, "rides")
    res.status(200).json({
      success: true,
      message: "Rides found successfully.",
      data
    });
  } catch (error) {
    console.error(`Unable to get rides: ${error}`);
    return next(createError(500, server_error))
  }
}
type FullPassenger = RidePassenger & {id: string}
const updatePassengersStatus = async (passengersArray: FullPassenger[], status: "ACTIVE" | "CANCELLED" | "ONGOING" | "COMPLETED") => {
  try {
    await Promise.all(
      passengersArray.map((passenger) =>
        RidePassengerModel.updateOneById(passenger.id, { status })
      )
    );
  } catch (error) {
    console.error("Error updating passenger statuses:", error);
  }
};
export const cancelRidePassenger = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const id = req.params.id;

  if (!userId) return next(createError(401, unauthorized_error));

  try {
    const [ride, user, passengers] = await Promise.all([rideModel.findOne({ id }), UserModel.findOne({ id: userId }), RidePassengerModel.find({
      userId,
      rideId: id,
      status: "ACTIVE"
    })]);
    if (!ride) return next(createError(404, "Ride not found."));
    if (!user) return next(createError(404, "User not found."));
    if (ride.status !== "ACTIVE") {
      return next(createError(400, "This ride is not active and cannot be cancelled."))
    }
    const foundPassengers = ride.passengers.filter(passenger => passenger.id === userId);
    if (foundPassengers.length === 0) {
      return next(createError(400, "You can't cancel this ride because you're not a passenger."));
    }
    // const wallet = await findWalletByUserId(foundPassengers[0].id)
    // if (!wallet) {
    //   return next(createError(400, "No wallet found for this user"))
    // }
    const refundAmount = foundPassengers.reduce((total, passenger) => total + passenger.seats * ride.pricePerSeat, 0);

   
  //   const refundSuccess = await addToWallet(wallet.id, refundAmount, wallet.balance);
  //   if (!refundSuccess) {
  //     return next(createError(500, unknown_error))
  //   }
  // const newTransaction =  await TransactionModel.insertOne({
  //     userId,
  //     amount: refundAmount,
  //     currency: "₦",
  //     type: TransactionType.REFUND,
  //     status: TransactionStatus.SUCCESS,
  //     reference: `txn_${Date.now()}_${userId}`,
  // });
  // if(newTransaction){
  //   io.emit("transaction", newTransaction)
  // }

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
    io.emit("ride:update", {...updatedRide, createdAt: new Date().toISOString()})
    if(passengers && passengers.length > 0){
    await updatePassengersStatus(passengers, "CANCELLED")
    }
    // for(const passenger of passengers)

    await createNotification({
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
      price: refundAmount
    })
    // const payouts = await PayoutModel.find({
    //   userId: ride.userId,
    //   requesterId: user.id,
    //   rideId: ride.id


    // })
    // for (const payout of payouts) {
    //   const updatedPayout = await PayoutModel.updateOneById(payout.id, {
    //     status: PayoutStatus.FAILED
    //   })
    //   if(updatedPayout){
    //     io.emit("payout:update", updatedPayout)
    //    }
    // }


    res.status(200).json({
      status: "success",
      message: "Ride successfully cancelled.",
      ride: updatedRide
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
    const [ride, driver, passengers] = await Promise.all([rideModel.findOne({ id }), UserModel.findOne({ id: driverId }), RidePassengerModel.find({
      rideId: id,
      status: "ACTIVE"
    })]);
    if (!ride) return next(createError(404, "Ride not found."));
    if (!driver) return next(createError(404, "User not found."));
    if (ride.status !== "ACTIVE") {
      return next(createError(400, "This ride is not active and cannot be cancelled."))
    }
    if (ride.userId !== driverId) return next(createError(400, "You can't cancel this ride because you're not the driver."));

    const updatedRide = await rideModel.updateOneById(ride.id, { status: "CANCELLED" });
    if (!updatedRide) return next(createError(500, unknown_error));
    if(passengers && passengers.length > 0){
      await updatePassengersStatus(passengers, "CANCELLED")
      }
    for (const passenger of ride.passengers) {
      try {
      
          const [ notification] = await Promise.all([
          
          createNotification({
            userId: passenger.id,
            type: NotificationType.RIDE_CANCELLED_BY_DRIVER,
            from: ride.from,
            to: ride.to,
            triggeredById: driverId,
            seats: passenger.seats,
            isRead: false,
            rideId: id,
            price: ride.pricePerSeat * passenger.seats,
            triggeredByAvatarUrl: driver.avatarUrl as string,
            triggeredByFirstName: driver.firstName as string,
            triggeredByLastName: driver.lastName as string,
            triggeredByUsername: driver.username as string,
          })
        
          ])
         
           
        
        
   


      } catch (error) {
        console.error(`Error processing passenger ${passenger.id}:`, error);

      }
    }
    const totalRides = Math.max(0, driver.totalRides ? driver.totalRides - 1 : 0);

    await UserModel.updateOneById(driver.id, {
      totalRides
    })
    io.emit("ride:update", {...updatedRide, createdAt: new Date().toISOString()})
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
    const [user, ride] = await Promise.all([
      UserModel.findOne({ id: userId }, {}),
      rideModel.findOne({ id }, {})
    ]);
    // const ride = await rideModel.findOne({ id });
    if (!user) return next(createError(404, "User not found."))
    if (!ride) return next(createError(404, "Ride not found."));
    if (ride.status !== "ACTIVE") {
      return next(createError(400, "This ride is not active and cannot be requested."))
    }
const rideDate = new Date(ride.date)
    if(isPastDate(rideDate)) {
      return next(createError(400, "You can't request for a ride that is in the past"));
    }
    // if (!wallet) return next(createError(400, "You need to create a wallet before requesting a ride."))
    if (ride.userId === userId) return next(createError(400, "You can't request this ride because you're the driver."));
    const amountOfSeatsLeft = ride.numberOfSeats - validSeats;
    if (amountOfSeatsLeft < 0) return next(createError(400, "Requested seats exceed the available seats."));
    const rideCost = ride.pricePerSeat * validSeats;
    // const isSufficient = hasSufficientBalance(wallet.balance, rideCost);
    // if (!isSufficient) {
    //   return next(createError(400, "Insufficient balance. Please fund your wallet."))
    // }

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
      price: rideCost
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
    const newNotification = await createNotification(params);
    if (!newNotification) {
      return next(createError(500, unknown_error))
    }
    // await deductFromWallet(wallet.id, rideCost, wallet.balance);
    // const userName = `${user.firstName} ${user.lastName}`
    // const [payout, transaction] = await Promise.all([
    //   PayoutModel.insertOne({
    //     userId: ride.userId,
    //     requesterId: userId,
    //     pickupLocation: ride.from,
    //     dropoffLocation: ride.to,
    //     amount: rideCost,
    //     userName,
    //     rideId: ride.id,
    //     status: PayoutStatus.PENDING,
    //     type: PayoutType.RIDE_PAYMENT,
    //     adminViewable: true
    //   }),
    //   TransactionModel.insertOne({
    //     userId,
    //     amount: rideCost,
    //     currency: "₦",
    //     type: TransactionType.RIDE_PAYMENT,
    //     status: TransactionStatus.SUCCESS,
    //     reference: `txn_${Date.now()}_${userId}`,
    // })
    // ])
    // if(payout){
    //   io.emit("payout", payout)
    // }
    // if(transaction) {
            
    //   io.emit('transaction', {...transaction, createdAt: new Date().toISOString()})
    // }
    // const payout = await PayoutModel.insertOne({
    //   userId: ride.userId,
    //   requesterId: userId,
    //   pickupLocation: ride.from,
    //   dropoffLocation: ride.to,
    //   amount: rideCost,
    //   userName,
    //   rideId: ride.id,
    //   status: PayoutStatus.PENDING,
    //   type: PayoutType.RIDE_PAYMENT,
    //   adminViewable: true
    // })
    // if (!payout) {
    //   return next(createError(500, unknown_error));
    // }
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

    const rideDate = new Date(ride.date)
    if(isPastDate(rideDate)) {
      return next(createError(400, "You can't accept ride request for a ride that is in the past"));
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
      completed: false,
    }]
    const newNoOfSeats = amountOfSeatsLeft;

    const updatedRide = await rideModel.updateOneById(ride.id, {
      passengers: newPassengers,
      numberOfSeats: newNoOfSeats,
    });
    if (!updatedRide) return next(createError(500, unknown_error));
const {avatarUrl, username, id: userId, email, firstName, lastName } = passenger;
const {from, to, date, pricePerSeat, estimatedTime, carImages, vehicleModel, color, plateNumber} = ride;
const inputDate = new Date(date);
  const userName = `${firstName} ${lastName}`
  
const validDate = isNaN(inputDate.getTime()) ? new Date(): inputDate;
  
const price = validSeats * ride.pricePerSeat;
await RidePassengerModel.insertOne({userId,
userUsername: username as string,
userAvatarUrl: avatarUrl as string,
status: "ACTIVE",
userName,
from,
to,
date: validDate.toISOString(),
seats: validSeats,
rideId,
pricePerSeat,
adminViewable: true,
userEmail: email as string,
estimatedTime,
carImages, vehicleModel, color, plateNumber,
driverId


})

    const newNotification = await createNotification({
      userId: passengerId,
      type: NotificationType.RIDE_ACCEPTED,
      from: notification.from,
      to: notification.to,
      triggeredById: driverId,
      seats: notification.seats,
      isRead: false,
      rideId,
      price,
      triggeredByAvatarUrl: driver.avatarUrl as string,
      triggeredByFirstName: driver.firstName as string,
      triggeredByLastName: driver.lastName as string,
      triggeredByUsername: driver.username as string,
    });
    if (!newNotification) {
      return next(createError(500, unknown_error))
    };

    await NotificationModel.deleteOneById(notification.id);
    io.emit("ride:update", {...updatedRide, createdAt: new Date().toISOString()})
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
    
    const rideDate = new Date(ride.date)
    if(isPastDate(rideDate)) {
      return next(createError(400, "You can't reject ride request for a ride that is in the past"));
    }

    // const wallet = await findWalletByUserId(notification.triggeredById)
    // if (!wallet) {
    //   return next(createError(400, "No wallet found for this user"))
    // }
    const refundAmount = notification.seats * ride.pricePerSeat;

    // Refund passenger
    // const refundSuccess = await addToWallet(wallet.id, refundAmount, wallet.balance);
    // if (!refundSuccess) {
    //   return next(createError(500, unknown_error))
    // }
  const [ newNotification] = await Promise.all([ 
  //    TransactionModel.insertOne({
  //     userId: notification.triggeredById,
  //     amount: refundAmount,
  //     currency: "₦",
  //     type: TransactionType.REFUND,
  //     status: TransactionStatus.SUCCESS,
  //     reference: `txn_${Date.now()}_${notification.triggeredById}`,
  // }), 
  createNotification({
    userId: passengerId,
    type: NotificationType.RIDE_REJECTED,
    from: notification.from,
    to: notification.to,
    triggeredById: driverId,
    seats: notification.seats,
    isRead: false,
    rideId,
    price: refundAmount,
    triggeredByAvatarUrl: driver.avatarUrl as string,
    triggeredByFirstName: driver.firstName as string,
    triggeredByLastName: driver.lastName as string,
    triggeredByUsername: driver.username as string,
  }), 
  // PayoutModel.find({
  //   userId: ride.userId,
  //   requesterId: notification.triggeredById,
  //   rideId: ride.id

  // })
])
  // if(transaction) {
            
  //   io.emit('transaction', transaction)
  // }
    // const newNotification = await createNotification({
    //   userId: passengerId,
    //   type: NotificationType.RIDE_REJECTED,
    //   from: notification.from,
    //   to: notification.to,
    //   triggeredById: driverId,
    //   seats: notification.seats,
    //   isRead: false,
    //   rideId,
    //   triggeredByAvatarUrl: driver.avatarUrl as string,
    //   triggeredByFirstName: driver.firstName as string,
    //   triggeredByLastName: driver.lastName as string,
    //   triggeredByUsername: driver.username as string,
    // })
    if (!newNotification) {
      return next(createError(500, unknown_error))
    }
    // const payouts = await PayoutModel.find({
    //   userId: ride.userId,
    //   requesterId: notification.triggeredById,
    //   rideId: ride.id

    // })
    // for (const payout of payouts) {
    //  const updatedPayout = await PayoutModel.updateOneById(payout.id, {
    //     status: PayoutStatus.FAILED
    //   })
    //   if(updatedPayout){
    //     io.emit("payout:update", updatedPayout)
    //    }
    // }
    
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
    const [ride, driver, passengers] = await Promise.all([rideModel.findOne({ id }), UserModel.findOne({ id: driverId }), RidePassengerModel.find({rideId: id, status: "ACTIVE"})]);
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

    const rideDate = new Date(ride.date)
    if(isPastDate(rideDate)) {
      return next(createError(400, "You can't start this ride because it is in the past"));
    }

    const updatedRide = await rideModel.updateOneById(ride.id, {
      status: "ONGOING"
    });
    if (!updatedRide) {
      return next(createError(500, unknown_error))
    }
    if(passengers && passengers.length > 0){
      await updatePassengersStatus(passengers, "ONGOING")
      } 
    for (const passenger of ride.passengers) {
      try {

        await createNotification({
          userId: passenger.id,
          type: NotificationType.RIDE_STARTED,
          from: ride.from,
          to: ride.to,
          triggeredById: driverId,
          seats: passenger.seats,
          isRead: false,
          rideId: id,
          price: ride.pricePerSeat * passenger.seats,
          triggeredByAvatarUrl: driver.avatarUrl as string,
          triggeredByFirstName: driver.firstName as string,
          triggeredByLastName: driver.lastName as string,
          triggeredByUsername: driver.username as string,
        })



      } catch (error) {
        console.error(`Error processing passenger ${passenger.id}:`, error);

      }
    }
    io.emit("ride:update", {...updatedRide, createdAt: new Date().toISOString()})
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
  const {notificationId} = req.body
  if (!userId) {
    return next(createError(401, unauthorized_error))
  }
  if(!notificationId) {
    return next(createError(400, "Notification ID is required"))
  }
  try {
    const [ride, user, notification, passengers] = await Promise.all([rideModel.findOne({ id }), UserModel.findOne({ id: userId }), NotificationModel.findOne({id: notificationId}), RidePassengerModel.find({rideId: id, status: "ONGOING"})]);
    if (!ride) {
      return next(createError(404, "Ride not found."))
    }
    if (!user) {
      return next(createError(404, "User not found."))
    }
    if (!notification) {
      return next(createError(404, "Notification not found."))
    }
    if (ride.status !== "COMPLETED") {
      return next(createError(400, "You can only confirm completion for a ride that has been marked as completed by the driver."));
    }
    const rideDate = new Date(ride.date)
    if(isPastDate(rideDate)) {
      return next(createError(400, "You can't confirm completion for this ride because it is in the past"));
    }

    // const wallet = await findWalletByUserId(ride.userId, WalletType.DRIVER);
    // if (!wallet) {
    //   return next(createError(404, "No wallet found for the driver"))
    // }
    const foundPassengers = ride.passengers.filter(passenger => passenger.id === userId);
    if (foundPassengers.length === 0) {
      return next(createError(400, "You can't confirm completion because you're not a passenger."));
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
    if(passengers && passengers.length > 0){
      await updatePassengersStatus(passengers, "COMPLETED")
      }
    // const allCompleted = updatedRide.passengers.every(passenger => passenger.completed === true);
    // if (allCompleted) {
    //   let totalPrice = 0;
    //   updatedRide.passengers.forEach(passenger => {
    //     totalPrice += passenger.seats * ride.pricePerSeat;
    //   });
    //   await addToWallet(wallet.id, totalPrice, wallet.balance);
    //   await createNotification({
    //     userId: ride.userId,
    //     type: NotificationType.RIDE_COMPLETETED_DRIVER,
    //     from: ride.from,
    //     to: ride.to,
    //     triggeredById: userId,
    //     seats: ride.numberOfSeats,
    //     isRead: false,
    //     rideId: id,
    //     price: totalPrice, 
    //     triggeredByAvatarUrl: user.avatarUrl as string,
    //     triggeredByFirstName: user.firstName as string,
    //     triggeredByLastName: user.lastName as string,
    //     triggeredByUsername: user.username as string,
    //   })
    //   const payouts = await PayoutModel.find({
    //     userId: ride.userId,
    //     requesterId: user.id,
    //     rideId: ride.id

    //   })
    //   for (const payout of payouts) {
    //     const updatedPayout = await PayoutModel.updateOneById(payout.id, {
    //       status: PayoutStatus.SUCCESSFUL
    //     })
    //     if(updatedPayout){
    //       io.emit("payout:update", updatedPayout)
    //      }
    //   }
// 
    // }
    const totalTrips = user.totalTrips ? user.totalTrips + 1 : 1;

await UserModel.updateOneById(user.id, {
  totalTrips
})

await NotificationModel.deleteOneById(notification.id);
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
    const rideDate = new Date(ride.date)
    if(isPastDate(rideDate)) {
      return next(createError(400, "You can't confirm completion for this ride because it is in the past"));
    }
    const updatedRide = await rideModel.updateOneById(ride.id, {
      status: "COMPLETED"
    })
    if (!updatedRide) {
      return next(createError(500, unknown_error))
    }
    for (const passenger of ride.passengers) {
      try {

        await createNotification({
          userId: passenger.id,
          type: NotificationType.RIDE_COMPLETETED_PASSENGER,
          from: ride.from,
          to: ride.to,
          triggeredById: driverId,
          seats: passenger.seats,
          isRead: false,
          rideId: id,
          price: ride.pricePerSeat * passenger.seats,
          triggeredByAvatarUrl: driver.avatarUrl as string,
          triggeredByFirstName: driver.firstName as string,
          triggeredByLastName: driver.lastName as string,
          triggeredByUsername: driver.username as string,
        })



      } catch (error) {
        console.error(`Error processing passenger ${passenger.id}:`, error);

      }
    }

    io.emit("ride:update", {...updatedRide, createdAt: new Date().toISOString()})
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