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
exports.searchRides = exports.createRide = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const ride_1 = require("../nobox/record-structures/ride");
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
        const ride = yield ride_1.rideModel.insertOne({
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
        return next((0, http_errors_1.default)(500, "Internal server error."));
    }
});
exports.createRide = createRide;
const searchRides = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, date } = req.query;
    if (!from || !to || !date) {
        res.status(400).json({
            success: false,
            message: "Please provide 'from', 'to', and 'date' parameters.",
        });
        return;
    }
    try {
        const rides = yield ride_1.rideModel.find({
            from: from,
            to: to,
            date: date,
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
    }
    catch (error) {
        console.error(`Error while searching for rides: ${error}`);
        next(new Error("Unable to search for rides."));
    }
});
exports.searchRides = searchRides;
