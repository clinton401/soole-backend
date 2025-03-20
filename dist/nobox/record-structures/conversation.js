"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationModel = exports.ConversationStructure = exports.ParticipantRole = void 0;
const config_1 = require("../config");
var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["DRIVER"] = "DRIVER";
    ParticipantRole["PASSENGER"] = "PASSENGER";
})(ParticipantRole || (exports.ParticipantRole = ParticipantRole = {}));
exports.ConversationStructure = {
    space: "Conversation",
    description: "A Record Space for Conversations",
    structure: {
        participant1Id: {
            description: "ID of the first participant",
            required: true,
            type: String,
        },
        participant2Id: {
            description: "ID of the second participant",
            required: true,
            type: String,
        },
        lastMessage: {
            description: "Content of the last message in the conversation",
            required: false,
            type: String,
        },
        lastMessageDate: {
            description: "Timestamp of when the last message was sent",
            required: false,
            type: String,
        },
        viewedBy: {
            description: "Array of participant IDs who have viewed the last message",
            required: false,
            type: Array,
        },
        deletedBy: {
            description: "Array of participant IDs who have deleted the conversation",
            required: false,
            type: Array,
        },
        participantsDetails: {
            description: "Details for each patricipants",
            required: true,
            type: Array
        },
        lastMessageSenderId: {
            description: "Sender id for the last message",
            required: false,
            type: String
        }
    },
};
exports.ConversationModel = (0, config_1.createRowSchema)(exports.ConversationStructure);
