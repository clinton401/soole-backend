"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintMessageModel = exports.ComplaintMessageStructure = exports.ComplaintSenderType = void 0;
const config_1 = require("../config");
var ComplaintSenderType;
(function (ComplaintSenderType) {
    ComplaintSenderType["USER"] = "USER";
    ComplaintSenderType["ADMIN"] = "ADMIN";
})(ComplaintSenderType || (exports.ComplaintSenderType = ComplaintSenderType = {}));
exports.ComplaintMessageStructure = {
    space: "ComplaintMessage",
    description: "A record space for complaint messages",
    structure: {
        conversationId: {
            description: "The ID of the complaint conversation",
            required: true,
            type: String,
        },
        senderId: {
            description: "The ID of the sender",
            required: true,
            type: String,
        },
        message: {
            description: "The content of the message",
            required: true,
            type: String,
        },
        userAvatarUrl: {
            description: "The avatar url of the user",
            required: false,
            type: String,
        },
        senderType: {
            description: "The type of sender (USER or ADMIN)",
            required: true,
            type: String,
        },
    },
};
exports.ComplaintMessageModel = (0, config_1.createRowSchema)(exports.ComplaintMessageStructure);
