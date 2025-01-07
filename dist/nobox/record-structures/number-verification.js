"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberVerificationModel = exports.NumberVerificationStructure = void 0;
const config_1 = require("../config");
exports.NumberVerificationStructure = {
    space: "Number-Verification",
    description: "A Record Space for phone number verification codes",
    structure: {
        code: {
            description: "Verification code",
            type: String,
            required: true
        },
        expiresAt: {
            description: "Expiration date for the verification code",
            required: true,
            type: String,
        },
        userId: {
            description: "User id for the owner of the verification code",
            required: true,
            type: String,
        },
    }
};
exports.NumberVerificationModel = (0, config_1.createRowSchema)(exports.NumberVerificationStructure);
