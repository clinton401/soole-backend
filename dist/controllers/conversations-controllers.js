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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markConversationAsRead = exports.deleteConversation = exports.markMessageAsRead = exports.getConversationMessages = exports.createMessage = exports.createConversation = exports.getUserConversations = void 0;
const variables_1 = require("../lib/variables");
const http_errors_1 = __importDefault(require("http-errors"));
const conversation_1 = require("../nobox/record-structures/conversation");
const __1 = require("..");
const conversation_2 = require("../data/conversation");
const message_1 = require("../data/message");
const getUserConversations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const conversations = yield (0, conversation_2.getUserTotalConversations)(userId);
        res.status(200).json({
            status: "success",
            message: "Conversations found successfully",
            conversations
        });
    }
    catch (error) {
        console.error(`Unable to get users conversation: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getUserConversations = getUserConversations;
const createConversation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const participant1Id = req.userId;
    const { participant2Id } = req.body;
    if (!participant1Id)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    if (!participant2Id)
        return next((0, http_errors_1.default)(400, "Participant 2 ID is required."));
    try {
        const conversation = yield (0, conversation_2.insertNewConversation)(participant1Id, participant2Id);
        if (!conversation)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        res.status(201).json({
            status: "success",
            message: "Conversation created successfully",
            conversation
        });
    }
    catch (error) {
        console.error(`Unable to get create conversation: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.createConversation = createConversation;
const createMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const conversationId = req.params.id;
    const { content, receiverId } = req.body;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    if (!receiverId || !content || content.length < 1)
        return next((0, http_errors_1.default)(400, "All fields are required. The 'content' field must contain at least one character."));
    try {
        const conversationExists = yield (0, conversation_2.findUnique)(conversationId);
        if (!conversationExists)
            return next((0, http_errors_1.default)(404, "Conversation not found or has been deleted."));
        if (conversationExists.participant1Id !== userId && conversationExists.participant2Id !== userId)
            return next((0, http_errors_1.default)(403, "You can't send a message because you are not a member of this conversation."));
        const message = yield (0, message_1.insertNewMessage)(conversationId, userId, receiverId, content);
        if (!message)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        const now = new Date().toISOString();
        const updatedConversation = yield conversation_1.ConversationModel.updateOneById(conversationId, { lastMessage: content, lastMessageDate: now });
        if (!updatedConversation)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        __1.io.emit("message", message);
        res.status(201).json({
            status: "success",
            message: "message sent successfully",
            data: message
        });
    }
    catch (error) {
        console.error(`Unable to get create message: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.createMessage = createMessage;
const getConversationMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationId = req.params.id;
    try {
        const messages = yield (0, message_1.findMany)(conversationId);
        res.status(200).json({
            status: "success",
            message: "Messages found successfully",
            messages
        });
    }
    catch (error) {
        console.error(`Unable to get conversation messages: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getConversationMessages = getConversationMessages;
const markMessageAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const message = yield (0, message_1.findUnique)(id);
        if (!message)
            return next((0, http_errors_1.default)(404, "Message not found."));
        if (message.receiverId !== userId)
            return next((0, http_errors_1.default)(403, "You are not authorized to mark this message as read. Only the receiver can perform this action."));
        if (message.isRead === true) {
            res.status(200).json({
                status: "success",
                message: "Message already marked as read.",
                data: message
            });
            return;
        }
        const updatedMessage = yield (0, message_1.updateOneById)(id);
        if (!updatedMessage)
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        res.status(200).json({
            status: "success",
            message: "Message marked as read successfully",
            data: updatedMessage
        });
    }
    catch (error) {
        console.error(`Unable to get mark message as read: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.markMessageAsRead = markMessageAsRead;
const deleteConversation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationId = req.params.id;
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const conversation = yield (0, conversation_2.findUnique)(conversationId);
        if (!conversation) {
            return next((0, http_errors_1.default)(404, "Conversation not found."));
        }
        const { participant1Id, participant2Id, deletedBy } = conversation;
        if (![participant1Id, participant2Id].includes(userId)) {
            return next((0, http_errors_1.default)(403, "You do not have permission to delete this conversation."));
        }
        if (deletedBy.includes(userId)) {
            return next((0, http_errors_1.default)(400, "This conversation has already been deleted by you."));
        }
        const updatedConversation = yield conversation_1.ConversationModel.updateOneById(conversationId, {
            deletedBy: [...deletedBy, userId],
        });
        if (!updatedConversation) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        res.status(200).json({
            status: "success",
            message: "Conversation deleted successfully.",
        });
    }
    catch (error) {
        console.error(`Error while deleting conversation: ${error}`);
        next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.deleteConversation = deleteConversation;
const markConversationAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const conversationId = req.params.id;
    const userId = req.userId;
    if (!userId)
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    try {
        const conversation = yield (0, conversation_2.findUnique)(conversationId);
        if (!conversation) {
            return next((0, http_errors_1.default)(404, "Conversation not found."));
        }
        const { participant1Id, participant2Id, viewedBy } = conversation;
        if (![participant1Id, participant2Id].includes(userId)) {
            return next((0, http_errors_1.default)(403, "You do not have permission to mark this conversation as read."));
        }
        if (viewedBy.includes(userId)) {
            return next((0, http_errors_1.default)(400, "This conversation has already been viewed by you."));
        }
        const updatedConversation = yield conversation_1.ConversationModel.updateOneById(conversationId, {
            viewedBy: [...viewedBy, userId],
        });
        if (!updatedConversation) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        res.status(200).json({
            status: "success",
            message: "Conversation marked as read successfully.",
        });
    }
    catch (error) {
        console.error(`Error while marking conversation as read: ${error}`);
        next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.markConversationAsRead = markConversationAsRead;
