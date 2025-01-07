"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetCodeModel = exports.ResetCodeStructure = void 0;
const config_1 = require("../config");
exports.ResetCodeStructure = {
    space: "Reset-Code",
    description: "A Record Space for phone reset password codes",
    structure: {
        code: {
            description: "Reset code",
            type: String,
            required: true
        },
        expiresAt: {
            description: "Expiration date for the reset code",
            required: true,
            type: String,
        },
        userId: {
            description: "User id for the owner of the reset code",
            required: true,
            type: String,
        },
    }
};
exports.ResetCodeModel = (0, config_1.createRowSchema)(exports.ResetCodeStructure);
