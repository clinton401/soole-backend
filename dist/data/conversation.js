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
exports.findUnique = exports.insertNewConversation = exports.getUserTotalConversations = void 0;
const conversation_1 = require("../nobox/record-structures/conversation");
const getUserTotalConversations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        pagination: {
            limit: 20,
            page: 1,
        },
        sort: {
            by: "createdAt",
            order: "desc",
        },
    };
    try {
        const convo1 = yield conversation_1.ConversationModel.find({ participant1Id: userId }, options);
        const convo2 = yield conversation_1.ConversationModel.find({ participant2Id: userId }, options);
        const totalConvo = [...convo1, ...convo2];
        const notDeletedConvo = totalConvo.filter(convo => {
            return !convo.deletedBy.includes(userId);
        }).sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return options.sort.order === "asc" ? dateA - dateB : dateB - dateA;
        });
        const start = (options.pagination.page - 1) * options.pagination.limit;
        const end = start + options.pagination.limit;
        const paginatedConvo = notDeletedConvo.slice(start, end);
        return paginatedConvo;
    }
    catch (error) {
        throw error;
    }
});
exports.getUserTotalConversations = getUserTotalConversations;
const insertNewConversation = (participant1Id, participant2Id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newConversation = yield conversation_1.ConversationModel.insertOne({
            participant1Id,
            participant2Id,
            lastMessage: undefined,
            lastMessageDate: undefined,
            viewedBy: [],
            deletedBy: [],
        });
        return newConversation;
    }
    catch (error) {
        throw error;
    }
});
exports.insertNewConversation = insertNewConversation;
const findUnique = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversation = yield conversation_1.ConversationModel.findOne({ id }, {});
        return conversation;
    }
    catch (error) {
        throw error;
    }
});
exports.findUnique = findUnique;
