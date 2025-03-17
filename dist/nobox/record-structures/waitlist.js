"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistModel = exports.WaitlistStructure = void 0;
const config_1 = require("../config");
exports.WaitlistStructure = {
    space: "Waitlist",
    description: "A Record Space for waitlist",
    structure: {
        email: {
            description: "Email of the user",
            required: true,
            type: String
        }
    },
};
exports.WaitlistModel = (0, config_1.createRowSchema)(exports.WaitlistStructure);
