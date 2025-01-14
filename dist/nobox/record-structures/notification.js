"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = exports.NotificationStructure = exports.NotificationType = void 0;
const config_1 = require("../config");
var NotificationType;
(function (NotificationType) {
    NotificationType["RIDE_REQUEST"] = "RIDE_REQUEST";
    NotificationType["RIDE_ACCEPTED"] = "RIDE_ACCEPTED";
    NotificationType["RIDE_REJECTED"] = "RIDE_REJECTED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
exports.NotificationStructure = {
    space: "Notification",
    description: "A record space for user notifications",
    structure: {
        userId: {
            description: "The ID of the user receiving the notification",
            required: true,
            type: String,
        },
        type: {
            description: "Type of the notification",
            required: true,
            type: String,
        },
        from: {
            description: "Starting point of the ride or request",
            required: true,
            type: String,
        },
        to: {
            description: "Destination of the ride or request",
            required: true,
            type: String,
        },
        rideId: {
            description: "id of the ride",
            required: true,
            type: String,
        },
        triggeredById: {
            description: "ID of the user who triggered the notification",
            required: true,
            type: String,
        },
        triggeredByAvatarUrl: {
            description: "Avatar URL of the user who triggered the notification",
            required: true,
            type: String,
        },
        triggeredByFirstName: {
            description: "First name of the user who triggered the notification",
            required: true,
            type: String,
        },
        triggeredByLastName: {
            description: "Last name of the user who triggered the notification",
            required: true,
            type: String,
        },
        triggeredByUsername: {
            description: "Username of the user who triggered the notification",
            required: true,
            type: String,
        },
        isRead: {
            description: "Indicates if the notification has been read",
            required: true,
            type: Boolean,
        },
        seats: {
            description: "Number of seats for a ride request",
            required: true,
            type: Number,
        },
    },
};
exports.NotificationModel = (0, config_1.createRowSchema)(exports.NotificationStructure);
