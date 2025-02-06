"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverConfirmCompletion = exports.passengerConfirmCompletion = exports.startRide = exports.rejectRideRequest = exports.acceptRideRequest = exports.getRide = exports.requestRide = exports.cancelRideDriver = exports.cancelRidePassenger = exports.getRides = exports.searchRides = exports.createRide = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const ride_1 = require("../nobox/record-structures/ride");
const user_1 = require("../nobox/record-structures/user");
const wallet_1 = require("../nobox/record-structures/wallet");
const notification_1 = require("../nobox/record-structures/notification");
const variables_1 = require("../lib/variables");
const payout_1 = require("../nobox/record-structures/payout");
const wallet_2 = require("../data/wallet");
const utils_1 = require("../lib/utils");
const createRide = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from, to, date, estimatedTime, carImages, vehicleModel, color, plateNumber, numberOfSeats, pricePerSeat, } = req.body;
        if (!from || !to) {
            return next((0, http_errors_1.default)(400, "Both 'from' and 'to' locations are required."));
        }
        const userId = req.userId;
        if (!userId) {
            return next((0, http_errors_1.default)(401, "Unauthorized. Please log in to create a ride."));
        }
        const validNumberOfSeats = Number(numberOfSeats);
        if (isNaN(validNumberOfSeats) || validNumberOfSeats <= 0) {
            return next((0, http_errors_1.default)(400, "Number of seats is required and must be greater than 0."));
        }
        if ((0, utils_1.hasDecimal)(validNumberOfSeats)) {
            return next((0, http_errors_1.default)(400, "Invalid number of seats: Please enter a whole number without decimals."));
        }
        // if (!validNumberOfSeats) return next(createError(400, "Number of seats is required."))
        // const user = await UserModel.findOne({ id: userId }, {});
        const [user, wallet] = yield Promise.all([
            user_1.UserModel.findOne({ id: userId }, {}),
            (0, wallet_2.findWalletByUserId)(userId, wallet_1.WalletType.DRIVER)
        ]);
        if (!user)
            return next((0, http_errors_1.default)(404, "User not found."));
        if (!wallet)
            return next((0, http_errors_1.default)(400, "You need to create a driver's wallet before creating a ride."));
        const ride = yield ride_1.rideModel.insertOne({
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
            adminViewable: true
        });
        if (!ride) {
            return next((0, http_errors_1.default)(500, "Failed to create the ride."));
        }
        const totalRides = user.totalRides ? user.totalRides + 1 : 1;
        yield user_1.UserModel.updateOneById(user.id, {
            totalRides
        });
        res.status(201).json({
            success: true,
            message: "Ride created successfully.",
            data: ride,
        });
    }
    catch (error) {
        console.error("Error creating ride:", error);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.createRide = createRide;
const searchRides = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, date } = req.query;
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
        const rides = yield ride_1.rideModel.find({
            from: from.toLowerCase(),
            to: to.toLowerCase(),
            date: date,
            status: "ACTIVE"
        });
        const ridesNotBookedByYou = rides.filter(ride => {
            return !ride.passengers.some(passenger => passenger.id === userId);
        });
        if (ridesNotBookedByYou.length === 0) {
            res.status(404).json({
                success: false,
                message: "No rides found for the given search criteria."
            });
            return;
        }
        const availableRides = ridesNotBookedByYou.filter(ride => {
            return ride.numberOfSeats > 0;
        });
        res.status(200).json({
            success: true,
            message: "Rides found successfully.",
            rides: availableRides,
        });
    }
    catch (error) {
        console.error(`Error while searching for rides: ${error}`);
        next(new Error("Unable to search for rides."));
    }
});
exports.searchRides = searchRides;
const getRides = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter } = req.query;
    const validFilters = ['active', 'completed', 'cancelled', "ongoing"];
    const selectedFilter = validFilters.includes(filter === null || filter === void 0 ? void 0 : filter.toLowerCase()) ? filter.toLowerCase() : 'active';
    const filterVariable = selectedFilter.toUpperCase();
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    ;
    try {
        const rides = yield ride_1.rideModel.find({
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
    }
    catch (error) {
        console.error(`Unable to get rides: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getRides = getRides;
const cancelRidePassenger = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const id = req.params.id;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const [ride, user] = yield Promise.all([ride_1.rideModel.findOne({ id }), user_1.UserModel.findOne({ id: userId })]);
        if (!ride)
            return next((0, http_errors_1.default)(404, "Ride not found."));
        if (!user)
            return next((0, http_errors_1.default)(404, "User not found."));
        if (ride.status !== "ACTIVE") {
            return next((0, http_errors_1.default)(400, "This ride is not active and cannot be cancelled."));
        }
        const foundPassengers = ride.passengers.filter(passenger => passenger.id === userId);
        if (foundPassengers.length === 0) {
            return next((0, http_errors_1.default)(400, "You can't cancel this ride because you're not a passenger."));
        }
        const wallet = yield (0, wallet_2.findWalletByUserId)(foundPassengers[0].id);
        if (!wallet) {
            return next((0, http_errors_1.default)(400, "No wallet found for this user"));
        }
        const refundAmount = foundPassengers.reduce((total, passenger) => total + passenger.seats * ride.pricePerSeat, 0);
        // Refund passenger
        const refundSuccess = yield (0, wallet_2.addToWallet)(wallet.id, refundAmount, wallet.balance);
        if (!refundSuccess) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const newPassengers = ride.passengers.filter(passenger => passenger.id !== userId);
        const totalSeatsToAdd = foundPassengers.reduce((total, passenger) => total + passenger.seats, 0);
        const newNoOfSeats = Math.max(ride.numberOfSeats + totalSeatsToAdd, 0);
        const updatedRide = yield ride_1.rideModel.updateOneById(ride.id, {
            passengers: newPassengers,
            numberOfSeats: newNoOfSeats,
        });
        if (!updatedRide) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        yield notification_1.NotificationModel.insertOne({
            userId: ride.userId,
            type: notification_1.NotificationType.RIDE_CANCELLED_BY_PASSENGER,
            from: ride.from,
            to: ride.to,
            triggeredById: user.id,
            seats: totalSeatsToAdd,
            isRead: false,
            rideId: id,
            triggeredByAvatarUrl: user.avatarUrl,
            triggeredByFirstName: user.firstName,
            triggeredByLastName: user.lastName,
            triggeredByUsername: user.username,
        });
        const payouts = yield payout_1.PayoutModel.find({
            userId: ride.userId,
            requesterId: user.id,
            rideId: ride.id
        });
        for (const payout of payouts) {
            yield payout_1.PayoutModel.updateOneById(payout.id, {
                status: payout_1.PayoutStatus.FAILED
            });
        }
        res.status(200).json({
            status: "success",
            message: "Ride successfully cancelled.",
            ride: updatedRide,
            wallet: refundSuccess
        });
    }
    catch (error) {
        console.error(`Unable to cancel ride as passenger: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.cancelRidePassenger = cancelRidePassenger;
const cancelRideDriver = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.userId;
    const id = req.params.id;
    if (!driverId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const [ride, driver] = yield Promise.all([ride_1.rideModel.findOne({ id }), user_1.UserModel.findOne({ id: driverId })]);
        if (!ride)
            return next((0, http_errors_1.default)(404, "Ride not found."));
        if (!driver)
            return next((0, http_errors_1.default)(404, "User not found."));
        if (ride.status !== "ACTIVE") {
            return next((0, http_errors_1.default)(400, "This ride is not active and cannot be cancelled."));
        }
        if (ride.userId !== driverId)
            return next((0, http_errors_1.default)(400, "You can't cancel this ride because you're not the driver."));
        const updatedRide = yield ride_1.rideModel.updateOneById(ride.id, { status: "CANCELLED" });
        if (!updatedRide)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        for (const passenger of ride.passengers) {
            try {
                const wallet = yield (0, wallet_2.findWalletByUserId)(passenger.id);
                if (wallet) {
                    const refundAmount = passenger.seats * ride.pricePerSeat;
                    // Refund passenger
                    const refundSuccess = yield (0, wallet_2.addToWallet)(wallet.id, refundAmount, wallet.balance);
                    if (!refundSuccess) {
                        console.error(`Failed to refund user ${passenger.id}`);
                        continue;
                    }
                }
                yield notification_1.NotificationModel.insertOne({
                    userId: passenger.id,
                    type: notification_1.NotificationType.RIDE_CANCELLED_BY_DRIVER,
                    from: ride.from,
                    to: ride.to,
                    triggeredById: driverId,
                    seats: passenger.seats,
                    isRead: false,
                    rideId: id,
                    triggeredByAvatarUrl: driver.avatarUrl,
                    triggeredByFirstName: driver.firstName,
                    triggeredByLastName: driver.lastName,
                    triggeredByUsername: driver.username,
                });
                const payouts = yield payout_1.PayoutModel.find({
                    userId: driverId,
                    requesterId: passenger.id,
                    rideId: ride.id
                });
                for (const payout of payouts) {
                    yield payout_1.PayoutModel.updateOneById(payout.id, {
                        status: payout_1.PayoutStatus.FAILED
                    });
                }
            }
            catch (error) {
                console.error(`Error processing passenger ${passenger.id}:`, error);
            }
        }
        const totalRides = Math.max(0, driver.totalRides ? driver.totalRides - 1 : 0);
        yield user_1.UserModel.updateOneById(driver.id, {
            totalRides
        });
        res.status(200).json({
            status: "success",
            message: "Ride successfully cancelled.",
            ride: updatedRide
        });
    }
    catch (error) {
        console.error(`Unable to cancel ride as driver: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.cancelRideDriver = cancelRideDriver;
const requestRide = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const userId = req.userId;
    const { seats } = req.body;
    const validSeats = Number(seats);
    if (isNaN(validSeats) || validSeats <= 0) {
        return next((0, http_errors_1.default)(400, "Number of seats is required and must be greater than 0."));
    }
    if ((0, utils_1.hasDecimal)(validSeats)) {
        return next((0, http_errors_1.default)(400, "Invalid number of seats: Please enter a whole number without decimals."));
    }
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const [user, ride, wallet] = yield Promise.all([
            user_1.UserModel.findOne({ id: userId }, {}),
            ride_1.rideModel.findOne({ id }, {}),
            (0, wallet_2.findWalletByUserId)(userId)
        ]);
        // const ride = await rideModel.findOne({ id });
        if (!user)
            return next((0, http_errors_1.default)(404, "User not found."));
        if (!ride)
            return next((0, http_errors_1.default)(404, "Ride not found."));
        if (ride.status !== "ACTIVE") {
            return next((0, http_errors_1.default)(400, "This ride is not active and cannot be requested."));
        }
        if (!wallet)
            return next((0, http_errors_1.default)(400, "You need to create a wallet before requesting a ride."));
        if (ride.userId === userId)
            return next((0, http_errors_1.default)(400, "You can't request this ride because you're the driver."));
        const amountOfSeatsLeft = ride.numberOfSeats - validSeats;
        if (amountOfSeatsLeft < 0)
            return next((0, http_errors_1.default)(400, "Requested seats exceed the available seats."));
        const rideCost = ride.pricePerSeat * validSeats;
        const isSufficient = (0, utils_1.hasSufficientBalance)(wallet.balance, rideCost);
        if (!isSufficient) {
            return next((0, http_errors_1.default)(400, "Insufficient balance. Please fund your wallet."));
        }
        const params = {
            userId: ride.userId,
            type: notification_1.NotificationType.RIDE_REQUEST,
            from: ride.from,
            to: ride.to,
            triggeredById: userId,
            seats: validSeats,
            isRead: false,
            rideId: id,
            triggeredByAvatarUrl: user.avatarUrl,
            triggeredByFirstName: user.firstName,
            triggeredByLastName: user.lastName,
            triggeredByUsername: user.username,
        };
        const existingRequest = yield notification_1.NotificationModel.findOne({
            userId: ride.userId,
            type: notification_1.NotificationType.RIDE_REQUEST,
            triggeredById: userId,
            from: ride.from,
            to: ride.to,
            rideId: id
        }, {});
        if (existingRequest)
            return next((0, http_errors_1.default)(400, "You have already requested this ride. Please wait for the driver's response."));
        const newNotification = yield notification_1.NotificationModel.insertOne(params);
        if (!newNotification) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        yield (0, wallet_2.deductFromWallet)(wallet.id, rideCost, wallet.balance);
        const userName = `${user.firstName} ${user.lastName}`;
        const payout = yield payout_1.PayoutModel.insertOne({
            userId: ride.userId,
            requesterId: userId,
            pickupLocation: ride.from,
            dropoffLocation: ride.to,
            amount: rideCost,
            userName,
            rideId: ride.id,
            status: payout_1.PayoutStatus.PENDING,
            type: payout_1.PayoutType.RIDE_PAYMENT
        });
        if (!payout) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        res.status(200).json({
            status: "success",
            message: "Ride request sent successfully. You will be notified once the driver responds.",
            // ride: updatedRide
        });
    }
    catch (error) {
        console.error(`Unable to request ride: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.requestRide = requestRide;
const getRide = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const ride = yield ride_1.rideModel.findOne({ id });
        if (!ride)
            return next((0, http_errors_1.default)(404, "Ride not found."));
        res.status(200).json({
            status: "success",
            ride
        });
    }
    catch (error) {
        console.error(`Unable to get ride: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getRide = getRide;
const acceptRideRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { passengerId, notificationId } = req.body;
    const driverId = req.userId;
    const rideId = req.params.id;
    if (!driverId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    if (!passengerId || !notificationId)
        return next((0, http_errors_1.default)(400, "The 'passengerId'  and 'notificationId' field is required in the request body."));
    try {
        const [notification, passenger, driver, ride] = yield Promise.all([
            notification_1.NotificationModel.findOne({ id: notificationId }, {}),
            user_1.UserModel.findOne({ id: passengerId }, {}),
            user_1.UserModel.findOne({ id: driverId }, {}),
            ride_1.rideModel.findOne({ id: rideId }, {}),
        ]);
        if (!notification)
            return next((0, http_errors_1.default)(404, "Notification not found."));
        if (!passenger)
            return next((0, http_errors_1.default)(404, "Passenger not found."));
        if (!driver)
            return next((0, http_errors_1.default)(404, "Driver not found."));
        if (!ride)
            return next((0, http_errors_1.default)(404, "Ride not found."));
        if (ride.status !== "ACTIVE") {
            return next((0, http_errors_1.default)(400, "You can only accept requests for active rides."));
        }
        if (notification.type !== notification_1.NotificationType.RIDE_REQUEST) {
            return next((0, http_errors_1.default)(400, "You can only accept  notifications of type 'RIDE_REQUEST'."));
        }
        if (ride.userId !== driverId)
            return next((0, http_errors_1.default)(403, "You can't accept this ride because you're not the driver."));
        const validSeats = notification.seats;
        const amountOfSeatsLeft = ride.numberOfSeats - validSeats;
        if (amountOfSeatsLeft < 0)
            return next((0, http_errors_1.default)(400, "Requested seats exceed the available seats."));
        const newPassengers = [...ride.passengers, {
                id: passengerId, seats: validSeats,
                completed: false,
            }];
        const newNoOfSeats = amountOfSeatsLeft;
        const updatedRide = yield ride_1.rideModel.updateOneById(ride.id, {
            passengers: newPassengers,
            numberOfSeats: newNoOfSeats,
        });
        if (!updatedRide)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        const newNotification = yield notification_1.NotificationModel.insertOne({
            userId: passengerId,
            type: notification_1.NotificationType.RIDE_ACCEPTED,
            from: notification.from,
            to: notification.to,
            triggeredById: driverId,
            seats: notification.seats,
            isRead: false,
            rideId,
            triggeredByAvatarUrl: driver.avatarUrl,
            triggeredByFirstName: driver.firstName,
            triggeredByLastName: driver.lastName,
            triggeredByUsername: driver.username,
        });
        if (!newNotification) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        ;
        yield notification_1.NotificationModel.deleteOneById(notification.id);
        res.status(200).json({
            status: "success",
            message: "Ride accepted successfully.",
        });
    }
    catch (error) {
        console.error(`Unable to accept ride request: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.acceptRideRequest = acceptRideRequest;
const rejectRideRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { notificationId, passengerId } = req.body;
    const driverId = req.userId;
    const rideId = req.params.id;
    if (!driverId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    if (!passengerId || !notificationId)
        return next((0, http_errors_1.default)(400, "The 'passengerId'  and 'notificationId' field is required in the request body."));
    try {
        const [notification, ride, driver] = yield Promise.all([
            notification_1.NotificationModel.findOne({ id: notificationId }, {}),
            ride_1.rideModel.findOne({ id: rideId }, {}),
            user_1.UserModel.findOne({ id: driverId }, {})
        ]);
        if (!notification)
            return next((0, http_errors_1.default)(404, "Notification not found."));
        if (!ride)
            return next((0, http_errors_1.default)(404, "Ride not found."));
        if (!driver)
            return next((0, http_errors_1.default)(404, "Driver not found."));
        if (ride.status !== "ACTIVE") {
            return next((0, http_errors_1.default)(400, "You can only reject requests for active rides."));
        }
        if (notification.type !== notification_1.NotificationType.RIDE_REQUEST) {
            return next((0, http_errors_1.default)(400, "You can only reject  notifications of type 'RIDE_REQUEST'."));
        }
        if (ride.userId !== driverId)
            return next((0, http_errors_1.default)(403, "You can't reject this ride because you're not the driver."));
        const wallet = yield (0, wallet_2.findWalletByUserId)(notification.triggeredById);
        if (!wallet) {
            return next((0, http_errors_1.default)(400, "No wallet found for this user"));
        }
        const refundAmount = notification.seats * ride.pricePerSeat;
        // Refund passenger
        const refundSuccess = yield (0, wallet_2.addToWallet)(wallet.id, refundAmount, wallet.balance);
        if (!refundSuccess) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const newNotification = yield notification_1.NotificationModel.insertOne({
            userId: passengerId,
            type: notification_1.NotificationType.RIDE_REJECTED,
            from: notification.from,
            to: notification.to,
            triggeredById: driverId,
            seats: notification.seats,
            isRead: false,
            rideId,
            triggeredByAvatarUrl: driver.avatarUrl,
            triggeredByFirstName: driver.firstName,
            triggeredByLastName: driver.lastName,
            triggeredByUsername: driver.username,
        });
        if (!newNotification) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const payouts = yield payout_1.PayoutModel.find({
            userId: ride.userId,
            requesterId: notification.triggeredById,
            rideId: ride.id
        });
        for (const payout of payouts) {
            yield payout_1.PayoutModel.updateOneById(payout.id, {
                status: payout_1.PayoutStatus.FAILED
            });
        }
        yield notification_1.NotificationModel.deleteOneById(notification.id);
        res.status(200).json({
            status: "success",
            message: "Ride rejected successfully.",
        });
    }
    catch (error) {
        console.error(`Unable to reject ride request: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.rejectRideRequest = rejectRideRequest;
const startRide = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const driverId = req.userId;
    if (!driverId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    try {
        const [ride, driver] = yield Promise.all([ride_1.rideModel.findOne({ id }), user_1.UserModel.findOne({ id: driverId })]);
        if (!ride) {
            return next((0, http_errors_1.default)(404, "Ride not found."));
        }
        if (!driver) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        if (ride.userId !== driverId) {
            return next((0, http_errors_1.default)(403, "You can't start this ride because you're not the driver."));
        }
        if (ride.status !== "ACTIVE") {
            return next((0, http_errors_1.default)(400, "This ride is not active and cannot be started."));
        }
        const updatedRide = yield ride_1.rideModel.updateOneById(ride.id, {
            status: "ONGOING"
        });
        if (!updatedRide) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        for (const passenger of ride.passengers) {
            try {
                yield notification_1.NotificationModel.insertOne({
                    userId: passenger.id,
                    type: notification_1.NotificationType.RIDE_STARTED,
                    from: ride.from,
                    to: ride.to,
                    triggeredById: driverId,
                    seats: passenger.seats,
                    isRead: false,
                    rideId: id,
                    triggeredByAvatarUrl: driver.avatarUrl,
                    triggeredByFirstName: driver.firstName,
                    triggeredByLastName: driver.lastName,
                    triggeredByUsername: driver.username,
                });
            }
            catch (error) {
                console.error(`Error processing passenger ${passenger.id}:`, error);
            }
        }
        res.json({
            status: "success",
            message: "Ride started successfully",
            ride: updatedRide
        });
    }
    catch (error) {
        console.error(`Unable to start ride: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.startRide = startRide;
const passengerConfirmCompletion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    try {
        const [ride, user] = yield Promise.all([ride_1.rideModel.findOne({ id }), user_1.UserModel.findOne({ id: userId })]);
        if (!ride) {
            return next((0, http_errors_1.default)(404, "Ride not found."));
        }
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        if (ride.status !== "COMPLETED") {
            return next((0, http_errors_1.default)(400, "You can only confirm completion for a ride that has been marked as completed by the driver."));
        }
        const wallet = yield (0, wallet_2.findWalletByUserId)(ride.userId, wallet_1.WalletType.DRIVER);
        if (!wallet) {
            return next((0, http_errors_1.default)(404, "No wallet found for the driver"));
        }
        const foundPassengers = ride.passengers.filter(passenger => passenger.id === userId);
        if (foundPassengers.length === 0) {
            return next((0, http_errors_1.default)(400, "You can't cancel this ride because you're not a passenger."));
        }
        const isMarkedAsCompleted = foundPassengers.every(passenger => passenger.completed === true);
        if (isMarkedAsCompleted) {
            return next((0, http_errors_1.default)(400, "You have already marked this ride as completed."));
        }
        const updatedPassengers = ride.passengers.map(passenger => {
            return passenger.id === userId ? Object.assign(Object.assign({}, passenger), { completed: true }) : passenger;
        });
        const updatedRide = yield ride_1.rideModel.updateOneById(ride.id, {
            passengers: updatedPassengers
        });
        if (!updatedRide) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const allCompleted = updatedRide.passengers.every(passenger => passenger.completed === true);
        if (allCompleted) {
            let totalPrice = 0;
            updatedRide.passengers.forEach(passenger => {
                totalPrice += passenger.seats * ride.pricePerSeat;
            });
            yield (0, wallet_2.addToWallet)(wallet.id, totalPrice, wallet.balance);
            yield notification_1.NotificationModel.insertOne({
                userId: ride.userId,
                type: notification_1.NotificationType.RIDE_COMPLETETED_DRIVER,
                from: ride.from,
                to: ride.to,
                triggeredById: userId,
                seats: ride.numberOfSeats,
                isRead: false,
                rideId: id,
                triggeredByAvatarUrl: user.avatarUrl,
                triggeredByFirstName: user.firstName,
                triggeredByLastName: user.lastName,
                triggeredByUsername: user.username,
            });
            const payouts = yield payout_1.PayoutModel.find({
                userId: ride.userId,
                requesterId: user.id,
                rideId: ride.id
            });
            for (const payout of payouts) {
                yield payout_1.PayoutModel.updateOneById(payout.id, {
                    status: payout_1.PayoutStatus.SUCCESSFUL
                });
            }
        }
        const totalTrips = user.totalTrips ? user.totalTrips + 1 : 1;
        yield user_1.UserModel.updateOneById(user.id, {
            totalTrips
        });
        res.json({
            status: "success",
            message: "Ride marked as completed successfully",
            ride: updatedRide
        });
    }
    catch (error) {
        console.error(`Unable to complete ride as passenger: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.passengerConfirmCompletion = passengerConfirmCompletion;
const driverConfirmCompletion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const driverId = req.userId;
    const id = req.params.id;
    if (!driverId) {
        next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    try {
        const [ride, driver] = yield Promise.all([ride_1.rideModel.findOne({ id }), user_1.UserModel.findOne({ id: driverId })]);
        if (!ride) {
            return next((0, http_errors_1.default)(404, "Ride not found."));
        }
        if (!driver) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        if (ride.status !== "ONGOING") {
            return next((0, http_errors_1.default)(400, "You can only confirm completion for an ongoing ride."));
        }
        if (ride.userId !== driverId)
            return next((0, http_errors_1.default)(400, "You can't mark this as completed ride because you're not the driver."));
        const updatedRide = yield ride_1.rideModel.updateOneById(ride.id, {
            status: "COMPLETED"
        });
        if (!updatedRide) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        for (const passenger of ride.passengers) {
            try {
                yield notification_1.NotificationModel.insertOne({
                    userId: passenger.id,
                    type: notification_1.NotificationType.RIDE_COMPLETETED_PASSENGER,
                    from: ride.from,
                    to: ride.to,
                    triggeredById: driverId,
                    seats: passenger.seats,
                    isRead: false,
                    rideId: id,
                    triggeredByAvatarUrl: driver.avatarUrl,
                    triggeredByFirstName: driver.firstName,
                    triggeredByLastName: driver.lastName,
                    triggeredByUsername: driver.username,
                });
            }
            catch (error) {
                console.error(`Error processing passenger ${passenger.id}:`, error);
            }
        }
        res.json({
            status: "success",
            message: "Ride marked as completed successfully. You will receive your payment once all passengers confirm the ride completion.",
            ride: updatedRide
        });
    }
    catch (error) {
        console.error(`Unable to complete ride as driver: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.driverConfirmCompletion = driverConfirmCompletion;
