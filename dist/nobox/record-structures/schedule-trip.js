"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleTripModel = exports.ScheduleTripStructure = void 0;
const config_1 = require("../config");
exports.ScheduleTripStructure = {
    space: "Schedule-Trip",
    description: "A Record Space for Scheduling trips",
    structure: {
        pickup: {
            description: "Pickup address",
            required: true,
            type: String,
        },
        destination: {
            description: "Destination address",
            required: true,
            type: String,
        },
        driverId: {
            description: "ID of the driver who scheduled the trip",
            required: true,
            type: String,
        },
        date: {
            description: "Date of the trip",
            required: true,
            type: String,
        },
        estimatiedTime: {
            description: "Estimated time of the trip",
            required: true,
            type: String,
        },
        vehicleModel: {
            description: "Vehicle model for the trip",
            required: true,
            type: String,
        },
        color: {
            description: "Color of the vehicle",
            required: true,
            type: String,
        },
        plateNumber: {
            description: "Plate Number of the vehicle",
            required: true,
            type: String,
        },
        noOfSeats: {
            description: "Number of seats on the vehicle",
            required: true,
            type: Number,
        },
        seatsLeft: {
            description: "Number of seats left on the vehicle",
            required: true,
            type: Number,
        },
        active: {
            description: "Is the trip still active",
            required: true,
            type: Boolean,
        },
        pricePerSeat: {
            description: "Price of each seat of a vehicle",
            required: true,
            type: Number,
        },
    }
};
exports.ScheduleTripModel = (0, config_1.createRowSchema)(exports.ScheduleTripStructure);
