"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintConversationModel = exports.ComplaintConversationStructure = exports.ComplaintStatus = void 0;
const config_1 = require("../config");
var ComplaintStatus;
(function (ComplaintStatus) {
    ComplaintStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ComplaintStatus["RESOLVED"] = "RESOLVED";
})(ComplaintStatus || (exports.ComplaintStatus = ComplaintStatus = {}));
exports.ComplaintConversationStructure = {
    space: "ComplaintConversation",
    description: "A record space for complaint conversations",
    structure: {
        userId: {
            description: "The user who submitted the complaint",
            required: true,
            type: String,
        },
        userName: {
            description: "Name of the user who submitted the complaint",
            required: true,
            type: String,
        },
        userEmail: {
            description: "Email of the user who submitted the complaint",
            required: true,
            type: String,
        },
        status: {
            description: "The current status of the complaint",
            required: true,
            type: String,
        },
        complaint: {
            description: "The complaint",
            required: true,
            type: String,
        },
        starred: {
            description: "Is the conversation starred",
            required: true,
            type: Boolean,
        },
        adminViewable: {
            description: "Is the conversation viewable by admin",
            required: true,
            type: Boolean,
        },
        isDeleted: {
            description: "Is the conversation moved to bin",
            required: true,
            type: Boolean,
        },
    },
};
exports.ComplaintConversationModel = (0, config_1.createRowSchema)(exports.ComplaintConversationStructure);
