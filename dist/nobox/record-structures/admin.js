"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModel = exports.AdminStructure = exports.AdminRole = void 0;
const config_1 = require("../config");
var AdminRole;
(function (AdminRole) {
    AdminRole["ADMIN"] = "ADMIN";
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
exports.AdminStructure = {
    space: "Admin",
    description: "A Record Space for admins",
    structure: {
        role: {
            description: "Role of the user",
            required: true,
            type: String
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
        },
        adminViewable: {
            description: "Is viewable by admin",
            required: true,
            type: Boolean
        },
        avatarUrl: {
            description: "Admin avatar url",
            required: false,
            type: String
        }
    },
};
exports.AdminModel = (0, config_1.createRowSchema)(exports.AdminStructure);
