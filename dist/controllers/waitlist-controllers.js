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
exports.joinWaitlist = void 0;
const waitlist_1 = require("../nobox/record-structures/waitlist");
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const schemas_1 = require("../schemas");
const html_templates_1 = require("../lib/html-templates");
const mail_1 = require("../data/mail");
const joinWaitlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const values = req.body;
    try {
        const validatedFields = schemas_1.JoinWailtlistSchema.safeParse(values);
        if (!validatedFields.success) {
            return next((0, http_errors_1.default)(400, "Please provide a valid email address to join the waitlist."));
        }
        const { email } = validatedFields.data;
        const hasJoinedBefore = yield waitlist_1.WaitlistModel.findOne({ email: email.toLowerCase() });
        if (hasJoinedBefore) {
            return next((0, http_errors_1.default)(400, "You have already joined the waitlist. Stay tuned for updates!"));
        }
        const newWaitlist = yield waitlist_1.WaitlistModel.insertOne({
            email: email.toLowerCase()
        });
        if (!newWaitlist) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const { template, text, subject } = (0, html_templates_1.welcomeEmailTemplate)(email.toLowerCase());
        yield (0, mail_1.sendEmail)(email.toLowerCase(), subject, text, template);
        res.status(201).json({
            status: "success",
            message: "You've successfully joined the waitlist! 🎉 Stay tuned for updates and early access opportunities."
        });
    }
    catch (error) {
        console.error(`Unable to allow user join waitlist: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.joinWaitlist = joinWaitlist;
