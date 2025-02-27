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
exports.moveComplaintsToBin = exports.markComplaintAsResolved = exports.starComplaintConversation = exports.getComplaintMessages = exports.replyToComplaint = exports.getMessagesSentByAdmin = exports.getComplaintConversations = exports.getComplaintSummary = void 0;
const complaint_conversation_1 = require("../nobox/record-structures/complaint-conversation");
const complaint_message_1 = require("../nobox/record-structures/complaint-message");
const variables_1 = require("../lib/variables");
const http_errors_1 = __importDefault(require("http-errors"));
const utils_1 = require("../lib/utils");
const html_templates_1 = require("../lib/html-templates");
const mail_1 = require("../data/mail");
const getComplaintSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [total, sentCount] = yield Promise.all([
            complaint_conversation_1.ComplaintConversationModel.find({ adminViewable: true }),
            complaint_message_1.ComplaintMessageModel.find({ senderType: complaint_message_1.ComplaintSenderType.ADMIN })
        ]);
        if (!total || !sentCount) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const total_count = total.length;
        const sent_count = sentCount.length;
        const starred_count = total.filter((complaint) => complaint.starred).length;
        const bin_count = total.filter((complaint) => complaint.isDeleted).length;
        const data = {
            total_count,
            sent_count,
            starred_count,
            bin_count
        };
        res.json({
            status: "success",
            message: "Summary fetched successfully",
            data
        });
    }
    catch (error) {
        console.error(`Unable to get complaint summary: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getComplaintSummary = getComplaintSummary;
const getComplaintConversations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter, page } = req.query;
    const validFilters = ['total', 'starred', 'bin'];
    const selectedFilter = validFilters.includes(filter === null || filter === void 0 ? void 0 : filter.toLowerCase()) ? filter.toLowerCase() : "total";
    const filterVariable = selectedFilter.toUpperCase();
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;
    const options = (0, utils_1.adminPaginationOptions)(currentPage, pageSize);
    try {
        let conversations = [];
        if (filterVariable === "STARRED") {
            const starred = yield complaint_conversation_1.ComplaintConversationModel.find({ starred: true }, options);
            conversations = starred.filter(convo => convo.isDeleted === false);
        }
        else if (filterVariable === "BIN") {
            conversations = yield complaint_conversation_1.ComplaintConversationModel.find({ isDeleted: true }, options);
        }
        else {
            const total = yield complaint_conversation_1.ComplaintConversationModel.find({ adminViewable: true }, options);
            conversations = total.filter(convo => convo.isDeleted === false);
        }
        if (!conversations) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const { totalLength: totalConversations, totalPages, nextPage } = (0, utils_1.getPageInfo)(conversations, pageSize, currentPage);
        res.json({
            status: "success",
            message: "Complaint conversations found successfully",
            data: {
                totalConversations, totalPages, nextPage, conversations
            }
        });
    }
    catch (error) {
        console.error(`Unable to get total complaint conversations ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getComplaintConversations = getComplaintConversations;
const getMessagesSentByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    try {
        const currentPage = Math.max(1, Number(page) || 1);
        const pageSize = 15;
        const options = (0, utils_1.adminPaginationOptions)(currentPage, pageSize);
        const messages = yield complaint_message_1.ComplaintMessageModel.find({ senderType: complaint_message_1.ComplaintSenderType.ADMIN }, options);
        if (!messages) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const { totalLength: totalMessages, totalPages, nextPage } = (0, utils_1.getPageInfo)(messages, pageSize, currentPage);
        res.json({
            status: "success",
            message: "Messages sent by admin found successfully",
            data: {
                totalMessages, totalPages, nextPage, messages
            }
        });
    }
    catch (error) {
        console.error(`Unable to get messages sent by admin: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getMessagesSentByAdmin = getMessagesSentByAdmin;
const replyToComplaint = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    if (!message || message.length < 2) {
        return next((0, http_errors_1.default)(400, "Message is required and must be at least 2 characters long"));
    }
    try {
        const conversation = yield complaint_conversation_1.ComplaintConversationModel.findOne({ id });
        if (!conversation) {
            return next((0, http_errors_1.default)(404, "Conversation not found."));
        }
        const data = {
            conversationId: id,
            message,
            senderId: userId,
            senderType: complaint_message_1.ComplaintSenderType.ADMIN
        };
        const reply = yield complaint_message_1.ComplaintMessageModel.insertOne(data);
        if (!reply) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const { subject, text, template } = (0, html_templates_1.adminReplyEmailTemplate)(conversation.userName, conversation.complaint, message);
        yield (0, mail_1.sendEmail)(conversation.userEmail, subject, text, template);
        res.json({
            status: "success",
            message: "Reply sent successfully",
            reply
        });
    }
    catch (error) {
        console.error(`Unable to reply to complaint: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.replyToComplaint = replyToComplaint;
const getComplaintMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { page } = req.query;
    try {
        const conversation = yield complaint_conversation_1.ComplaintConversationModel.findOne({ id });
        if (!conversation) {
            return next((0, http_errors_1.default)(404, "Conversation not found."));
        }
        ;
        const currentPage = Math.max(1, Number(page) || 1);
        const pageSize = 15;
        const options = (0, utils_1.adminPaginationOptions)(currentPage, pageSize, "asc");
        const messages = yield complaint_message_1.ComplaintMessageModel.find({ conversationId: id }, options);
        if (!messages) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const { totalLength: totalMessages, totalPages, nextPage } = (0, utils_1.getPageInfo)(messages, pageSize, currentPage);
        res.json({
            status: "success",
            message: "Messages  found successfully",
            data: {
                totalMessages, totalPages, nextPage, messages
            }
        });
    }
    catch (error) {
        console.error(`Unable to get complaint messages: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getComplaintMessages = getComplaintMessages;
const starComplaintConversation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { starred } = req.body;
    if (typeof starred !== "boolean") {
        return next((0, http_errors_1.default)(400, "Invalid starred value. Must be true or false."));
    }
    try {
        const conversation = yield complaint_conversation_1.ComplaintConversationModel.findOne({ id });
        if (!conversation) {
            return next((0, http_errors_1.default)(404, "Conversation not found."));
        }
        ;
        if (conversation.starred === starred) {
            return next((0, http_errors_1.default)(400, `Conversation has already been ${starred ? "starred" : "unstarred"}`));
        }
        const updatedConversation = yield complaint_conversation_1.ComplaintConversationModel.updateOneById(id, { starred });
        if (!updatedConversation) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        res.json({
            status: "success",
            message: `Complaint ${starred ? "starred" : "unstarred"} successfully.`,
            conversation: updatedConversation
        });
    }
    catch (error) {
        console.error(`Unable to star complaint conversation: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.starComplaintConversation = starComplaintConversation;
const markComplaintAsResolved = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const conversation = yield complaint_conversation_1.ComplaintConversationModel.findOne({ id });
        if (!conversation) {
            return next((0, http_errors_1.default)(404, "Conversation not found."));
        }
        ;
        if (conversation.status === complaint_conversation_1.ComplaintStatus.RESOLVED) {
            return next((0, http_errors_1.default)(400, "Complaint has already been marked as completed."));
        }
        ;
        const updatedConversation = yield complaint_conversation_1.ComplaintConversationModel.updateOneById(id, { status: complaint_conversation_1.ComplaintStatus.RESOLVED });
        if (!updatedConversation) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        res.json({
            status: "success",
            message: "Complaint marked as resolved successfully.",
            conversation: updatedConversation
        });
    }
    catch (error) {
        console.error(`Unable to mark complaint as resolved`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.markComplaintAsResolved = markComplaintAsResolved;
const moveComplaintsToBin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { complaintIds } = req.body;
    if (!Array.isArray(complaintIds) || complaintIds.length < 1 || !complaintIds.every(id => typeof id === "string")) {
        return next((0, http_errors_1.default)(400, "Invalid complaint IDs. Must be an non empty array of complaint IDs"));
    }
    ;
    try {
        const complaints = [];
        for (const id of complaintIds) {
            try {
                const complaint = yield complaint_conversation_1.ComplaintConversationModel.findOne({ id });
                if (!complaint || complaint.isDeleted === true)
                    continue;
                const updatedComplaint = yield complaint_conversation_1.ComplaintConversationModel.updateOneById(id, { isDeleted: true });
                if (!updatedComplaint) {
                    continue;
                }
                complaints.push(updatedComplaint);
            }
            catch (error) {
                console.error(`Unable to move complaint of ${id} to bin: ${error}`);
            }
        }
        if (complaints.length < 1) {
            return next((0, http_errors_1.default)(500, "Failed to move complaints to the bin. Please try again."));
        }
        if (complaints.length < complaintIds.length) {
            res.json({
                status: "success",
                message: "Some complaints were successfully moved to the bin, but some could not be processed."
            });
            return;
        }
        res.json({
            status: "success",
            message: "Complaints moved to bin successfully."
        });
    }
    catch (error) {
        console.error(`Unable to move complaints to bin: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.moveComplaintsToBin = moveComplaintsToBin;
