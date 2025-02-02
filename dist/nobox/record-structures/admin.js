"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModel = exports.AdminStructure = void 0;
const config_1 = require("../config");
exports.AdminStructure = {
    space: "Admin",
    description: "A Record Space for admins",
    structure: {
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
        username: {
            description: "Admin username",
            required: true,
            type: String
        }
    },
};
exports.AdminModel = (0, config_1.createRowSchema)(exports.AdminStructure);
