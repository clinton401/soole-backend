"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RidePassengerModel = exports.RidePassengerStructure = void 0;
const config_1 = require("../config");
exports.RidePassengerStructure = {
    space: "Ride-Passenger",
    description: "A Record Space for Ride Passengers",
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
        status: {
            description: "Status of the ride",
            type: String,
            required: true,
        },
        date: {
            description: "Date",
            type: String,
            required: false,
        },
        seats: {
            description: "Number of seats booked",
            type: Number,
            required: true,
        },
        completed: {
            description: "Is the ride completed?",
            type: Boolean,
            required: true,
        },
        rideId: {
            description: "Ride ID",
            type: String,
            required: true,
        },
        pricePerSeat: {
            description: "Price per seat",
            type: Number,
            required: true,
        },
        adminViewable: {
            description: "Should admin be able to view this data?",
            type: Boolean,
            required: true,
        },
    },
};
exports.RidePassengerModel = (0, config_1.createRowSchema)(exports.RidePassengerStructure);
