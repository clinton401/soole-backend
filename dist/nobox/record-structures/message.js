"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = exports.MessageStructure = void 0;
const config_1 = require("../config");
exports.MessageStructure = {
    space: "Message",
    description: "A Record Space for Messages",
    structure: {
        conversationId: {
            description: "ID of the Conversation this Message belongs to",
            required: true,
            type: String,
        },
        senderId: {
            description: "ID of the User who sent the Message",
            required: true,
            type: String,
        },
        receiverId: {
            description: "ID of the User who receives the Message",
            required: true,
            type: String,
        },
        content: {
            description: "Content of the Message",
            required: true,
            type: String,
        },
        isRead: {
            description: "Whether the message has been read by the receiver",
            required: true,
            type: Boolean,
        },
    },
};
exports.MessageModel = (0, config_1.createRowSchema)(exports.MessageStructure);
