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
        driverId: {
            description: "Driver ID",
            type: String,
            required: true,
        },
        from: {
            description: "From Location",
            type: String,
            required: true,
        },
        userAvatarUrl: {
            description: "Avatar URL of the user",
            type: String,
            required: true,
        },
        userUsername: {
            description: "Username of the user",
            type: String,
            required: true,
        },
        userName: {
            description: "Name of the user",
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
            description: "Date of the ride",
            type: String,
            required: true,
        },
        seats: {
            description: "Number of seats booked",
            type: Number,
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
        userEmail: {
            description: "Email of the user",
            type: String,
            required: false,
        },
        estimatedTime: {
            description: "Estimated arrival time",
            type: String,
            required: false,
        },
        carImages: {
            description: "Images of the car",
            type: Array,
            required: false,
        },
        vehicleModel: {
            description: "Model of the vehicle",
            type: String,
            required: false,
        },
        color: {
            description: "Color of the vehicle",
            type: String,
            required: false,
        },
        plateNumber: {
            description: "License plate number of the vehicle",
            type: String,
            required: false,
        },
    },
};
exports.RidePassengerModel = (0, config_1.createRowSchema)(exports.RidePassengerStructure);
