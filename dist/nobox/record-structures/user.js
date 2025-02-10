"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.UserStructure = exports.UserStatus = void 0;
const config_1 = require("../config");
var UserStatus;
(function (UserStatus) {
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["DEACTIVATED"] = "DEACTIVATED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
exports.UserStructure = {
    space: "User",
    description: "A Record Space for Users",
    structure: {
        phone: {
            description: "User's Phone Number",
            required: true,
            type: String,
        },
        firstName: {
            description: "User's First Name",
            type: String,
            required: false,
        },
        lastName: {
            description: "User's Last Name",
            type: String,
            required: false,
        },
        password: {
            description: "User's Password",
            required: false,
            type: String,
            // hashed: true
        },
        isNumberVerified: {
            description: "User's Verified Status",
            required: true,
            type: Boolean,
        },
        gender: {
            description: "User's Gender",
            required: false,
            type: String,
        },
        dob: {
            description: "User's Date of Birth ",
            required: false,
            type: String,
        },
        bio: {
            description: "User's Bio ",
            required: false,
            type: String,
        },
        username: {
            description: "User's Username",
            required: false,
            type: String,
        },
        avatarUrl: {
            description: "User's Avatar URL",
            required: false,
            type: String,
        },
        avatarPublicId: {
            description: "User's Avatar Publid ID",
            required: false,
            type: String,
        },
        email: {
            description: "User's  Email Address",
            required: false,
            type: String,
        },
        totalTrips: {
            description: "Total amount of trips a user has",
            required: true,
            type: Number,
        },
        totalRides: {
            description: "Total amount of rides a user created",
            required: true,
            type: Number,
        },
        status: {
            description: "Status of the user",
            required: true,
            type: String,
        },
        // analyticsDate : {
        //   description: "Analytics date for the user ",
        //   required: true,
        //   type: Number,
        // },
    },
};
exports.UserModel = (0, config_1.createRowSchema)(exports.UserStructure);
