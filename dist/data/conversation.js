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
exports.conversationExists = exports.findUnique = exports.insertNewConversation = exports.getUserTotalConversations = void 0;
const utils_1 = require("../lib/utils");
const conversation_1 = require("../nobox/record-structures/conversation");
const user_1 = require("../nobox/record-structures/user");
const variables_1 = require("../lib/variables");
const __1 = require("..");
const getUserTotalConversations = (userId, page) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentPage = Math.max(1, Number(page) || 1);
        const options = (0, utils_1.paginationOptions)("desc");
        const convo1 = yield conversation_1.ConversationModel.find({ participant1Id: userId }, options);
        const convo2 = yield conversation_1.ConversationModel.find({ participant2Id: userId }, options);
        if (!convo1 || !convo2) {
            throw new Error(variables_1.unknown_error);
        }
        const totalConvo = [...convo1, ...convo2];
        const notDeletedConvo = totalConvo.filter(convo => {
            return !convo.deletedBy.includes(userId);
        }).sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return options.sort.order === "asc" ? dateA - dateB : dateB - dateA;
        });
        const pageSize = 50;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paginatedConvo = notDeletedConvo.slice(start, end);
        const totalLength = notDeletedConvo.length;
        const totalPages = Math.ceil(totalLength / pageSize);
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;
        const prevPage = currentPage > 1 ? currentPage - 1 : null;
        return {
            conversations: paginatedConvo, currentPage,
            totalLength,
            totalPages,
            nextPage,
            prevPage
        };
    }
    catch (error) {
        throw error;
    }
});
exports.getUserTotalConversations = getUserTotalConversations;
const insertNewConversation = (participant1Id, participant2Id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [participant1, participant2, convo1, convo2] = yield Promise.all([
            user_1.UserModel.findOne({ id: participant1Id }),
            user_1.UserModel.findOne({ id: participant2Id }),
            conversation_1.ConversationModel.findOne({ participant1Id, participant2Id }),
            conversation_1.ConversationModel.findOne({ participant1Id: participant2Id, participant2Id: participant1Id }),
        ]);
        let updatedConversation;
        if (convo1) {
            const isConvo1Deleted = convo1.deletedBy.includes(participant1Id);
            const newDeletedArray = convo1.deletedBy.filter(id => {
                return id !== participant1Id;
            });
            if (isConvo1Deleted) {
                updatedConversation = yield conversation_1.ConversationModel.updateOneById(convo1.id, {
                    deletedBy: newDeletedArray
                });
                if (!updatedConversation) {
                    return variables_1.unknown_error;
                }
                return updatedConversation;
            }
            return convo1;
        }
        if (convo2) {
            const isConvo2Deleted = convo2.deletedBy.includes(participant1Id);
            const newDeletedArray = convo2.deletedBy.filter(id => {
                return id !== participant1Id;
            });
            if (isConvo2Deleted) {
                updatedConversation = yield conversation_1.ConversationModel.updateOneById(convo2.id, {
                    deletedBy: newDeletedArray
                });
                if (!updatedConversation) {
                    return variables_1.unknown_error;
                }
                return updatedConversation;
            }
            return convo2;
        }
        if (!participant1 || !participant2) {
            return "One or more participants do not exist. Please check the provided IDs.";
        }
        if (!participant1.avatarUrl || !participant2.avatarUrl) {
            return "Both participants must have a profile picture.";
        }
        const participantsDetails = [
            {
                id: participant1.id,
                name: `${participant1.firstName} ${participant1.lastName}`,
                avatarUrl: participant1.avatarUrl
            },
            {
                id: participant2.id,
                name: `${participant2.firstName} ${participant2.lastName}`,
                avatarUrl: participant2.avatarUrl
            }
        ];
        const newConversation = yield conversation_1.ConversationModel.insertOne({
            participant1Id,
            participant2Id,
            viewedBy: [],
            deletedBy: [],
            participantsDetails
        });
        __1.io.emit("conversation", newConversation);
        return newConversation;
    }
    catch (error) {
        return "An unexpected error occurred while creating the conversation.";
    }
});
exports.insertNewConversation = insertNewConversation;
const findUnique = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversation = yield conversation_1.ConversationModel.findOne({ id }, {});
        const isConvoDeleted = conversation.deletedBy.includes(userId);
        return isConvoDeleted ? null : conversation;
    }
    catch (error) {
        throw error;
    }
});
exports.findUnique = findUnique;
const conversationExists = (id1, id2) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [convo1, convo2] = yield Promise.all([
            conversation_1.ConversationModel.findOne({ participant1Id: id1, participant2Id: id2 }),
            conversation_1.ConversationModel.findOne({ participant1Id: id2, participant2Id: id1 })
        ]);
        if (convo1) {
            const isConvo1Deleted = convo1.deletedBy.includes(id1) || convo1.deletedBy.includes(id2);
            return !isConvo1Deleted;
        }
        if (convo2) {
            const isConvo2Deleted = convo2.deletedBy.includes(id1) || convo2.deletedBy.includes(id2);
            return !isConvo2Deleted;
        }
        return false;
    }
    catch (error) {
        throw error;
    }
});
exports.conversationExists = conversationExists;
