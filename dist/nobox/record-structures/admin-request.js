"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRequestModel = exports.AdminRequestStructure = void 0;
const config_1 = require("../config");
exports.AdminRequestStructure = {
    space: "Admin-Request",
    description: "A Record Space for admin requests",
    structure: {
        adminViewable: {
            description: "Is row visible to admins",
            required: true,
            type: Boolean
        },
        phone: {
            description: "Admin's Phone Number",
            required: true,
            type: String,
        },
        password: {
            description: "Admin's Password",
            required: true,
            type: String,
            // hashed: true
        },
        workEmail: {
            description: "Admin's Work Email Address",
            required: true,
            type: String,
        },
        personalEmail: {
            description: "Admin's Personal Email Address",
            required: true,
            type: String,
        },
        name: {
            description: "Admin name",
            required: true,
            type: String
        }
    },
};
exports.AdminRequestModel = (0, config_1.createRowSchema)(exports.AdminRequestStructure);
