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
exports.updateOneById = exports.findMany = exports.findUnique = exports.insertNewMessage = void 0;
const message_1 = require("../nobox/record-structures/message");
const utils_1 = require("../lib/utils");
const insertNewMessage = (conversationId, senderId, receiverId, content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newConversation = yield message_1.MessageModel.insertOne({
            conversationId,
            senderId,
            receiverId,
            content,
            isRead: false
        });
        return newConversation;
    }
    catch (error) {
        throw error;
    }
});
exports.insertNewMessage = insertNewMessage;
const findUnique = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield message_1.MessageModel.findOne({ id }, {});
        return message;
    }
    catch (error) {
        throw error;
    }
});
exports.findUnique = findUnique;
const findMany = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = (0, utils_1.paginationOptions)("asc");
        const messages = yield message_1.MessageModel.find({ conversationId }, options);
        return messages;
    }
    catch (error) {
        throw error;
    }
});
exports.findMany = findMany;
const updateOneById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedMessage = yield message_1.MessageModel.updateOneById(id, {
            isRead: true
        });
        return updatedMessage;
    }
    catch (error) {
        throw error;
    }
});
exports.updateOneById = updateOneById;
