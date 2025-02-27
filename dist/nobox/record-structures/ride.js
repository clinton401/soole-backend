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
        passengers: {
            description: "Id of the passengers",
            type: Array,
            required: true,
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
            type: Number,
            required: true,
        },
        pricePerSeat: {
            description: "Price Per Seat",
            type: Number,
            required: true,
        },
        // Missing properties added below
        userAvatarUrl: {
            description: "Avatar URL of the user",
            type: String,
            required: false,
        },
        userFirstName: {
            description: "First Name of the user",
            type: String,
            required: false,
        },
        userLastName: {
            description: "Last Name of the user",
            type: String,
            required: false,
        },
        userUsername: {
            description: "Username of the user",
            type: String,
            required: false,
        },
        adminViewable: {
            description: "Should admin be able to view this data",
            type: String,
            required: true,
            defaultValue: true
        },
        analyticsDate: {
            description: "Analytics date for the user ",
            required: true,
            type: String,
        },
    },
};
exports.rideModel = (0, config_1.createRowSchema)(exports.RideStructure);
