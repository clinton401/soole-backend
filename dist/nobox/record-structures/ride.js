"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rideModel = exports.RideStructure = void 0;
const config_1 = require("../config");
exports.RideStructure = {
    space: "Ride",
    description: "A Record Space for Ride",
    structure: {
        userId: {
            description: "User ID",
            type: String,
            required: true,
        },
        from: {
            description: "From Location",
            type: String,
            required: true,
        },
        to: {
            description: "To Location",
            type: String,
            required: true,
        },
        date: {
            description: "Date",
            type: String,
            required: false,
        },
        estimatedTime: {
            description: "Estimated Time",
            type: String,
            required: false,
        },
        carImages: {
            description: "Images Of the Vehicle",
            type: Array,
            required: false,
        },
        vehicleModel: {
            description: "Vehicle Model",
            type: String,
            required: false,
        },
        color: {
            description: "Vehicle Color",
            type: String,
            required: false,
        },
        plateNumber: {
            description: "Vehicle Plate Number",
            type: String,
            required: false,
        },
        numberOfSeats: {
            description: "Number of Seats",
            type: String,
            required: false,
        },
        pricePerSeat: {
            description: "Price Per Seat",
            type: String,
            required: false,
        },
    },
};
exports.rideModel = (0, config_1.createRowSchema)(exports.RideStructure);
