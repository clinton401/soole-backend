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
exports.getRide = exports.requestRide = exports.cancelRideDriver = exports.cancelRidePassenger = exports.searchRides = exports.createRide = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const ride_1 = require("../nobox/record-structures/ride");
const variables_1 = require("../lib/variables");
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
        if (!validNumberOfSeats)
            return next((0, http_errors_1.default)(400, "Number of seats is required."));
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
            passengers: []
        });
        if (!ride) {
            return next((0, http_errors_1.default)(500, "Failed to create the ride."));
        }
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
const cancelRidePassenger = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const id = req.params.id;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const ride = yield ride_1.rideModel.findOne({ id });
        if (!ride)
            return next((0, http_errors_1.default)(404, "Ride not found."));
        const foundPassenger = ride.passengers.find(passenger => passenger.id === userId);
        if (!foundPassenger) {
            return next((0, http_errors_1.default)(400, "You can't cancel this ride because you're not a passenger."));
        }
        const newPassengers = ride.passengers.filter(passenger => passenger.id !== userId);
        const newNoOfSeats = Math.max(ride.numberOfSeats + foundPassenger.seats, 0);
        const updatedRide = yield ride_1.rideModel.updateOneById(ride.id, {
            passengers: newPassengers,
            numberOfSeats: newNoOfSeats,
        });
        if (!updatedRide) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        res.status(200).json({
            status: "success",
            message: "Ride successfully cancelled.",
            ride: updatedRide,
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
        const ride = yield ride_1.rideModel.findOne({ id });
        if (!ride)
            return next((0, http_errors_1.default)(404, "Ride not found."));
        if (ride.userId !== driverId)
            return next((0, http_errors_1.default)(400, "You can't cancel this ride because you're not the driver."));
        const updatedRide = yield ride_1.rideModel.updateOneById(ride.id, { status: "CANCELLED" });
        if (!updatedRide)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
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
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const ride = yield ride_1.rideModel.findOne({ id });
        if (!ride)
            return next((0, http_errors_1.default)(404, "Ride not found."));
        if (ride.userId === userId)
            return next((0, http_errors_1.default)(400, "You can't request this ride because you're the driver."));
        const amountOfSeatsLeft = ride.numberOfSeats - validSeats;
        if (amountOfSeatsLeft < 0)
            return next((0, http_errors_1.default)(400, "Requested seats exceed the available seats."));
        const newPassengers = [...ride.passengers, { id: userId, seats: validSeats }];
        const newNoOfSeats = amountOfSeatsLeft;
        const updatedRide = yield ride_1.rideModel.updateOneById(ride.id, {
            passengers: newPassengers,
            numberOfSeats: newNoOfSeats,
        });
        if (!updatedRide)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        res.status(200).json({
            status: "success",
            message: "Ride requested successfully.",
            ride: updatedRide
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
