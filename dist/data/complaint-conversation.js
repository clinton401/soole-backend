"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComplaintConversation = void 0;
const complaint_message_1 = require("../nobox/record-structures/complaint-message");
const complaint_conversation_1 = require("../nobox/record-structures/complaint-conversation");
const createComplaintConversation = (user, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userName = user.firstName + " " + user.lastName;
        const convoData = {
            userId: user.id,
            userName,
            userEmail: user.email,
            status: complaint_conversation_1.ComplaintStatus.IN_PROGRESS,
            complaint: message,
            starred: false,
            adminViewable: true,
            isDeleted: false,
        };
        const complaintConversation = yield complaint_conversation_1.ComplaintConversationModel.insertOne(convoData);
        if (!complaintConversation) {
            throw new Error("Unable to create complaint conversation");
        }
        const messageData = {
            conversationId: complaintConversation.id,
            userAvatarUrl: user.avatarUrl,
            senderId: user.id,
            message,
            senderType: complaint_message_1.ComplaintSenderType.USER
        };
        const complaintMessage = yield complaint_message_1.ComplaintMessageModel.insertOne(messageData);
        if (!complaintMessage) {
            throw new Error("Unable to intiate complaint conversation with a message");
        }
        return { complaintMessage, complaintConversation };
    }
    catch (error) {
        throw error;
    }
});
exports.createComplaintConversation = createComplaintConversation;
