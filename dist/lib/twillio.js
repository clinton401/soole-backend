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
exports.twillio = void 0;
const twilio_1 = __importDefault(require("twilio"));
const twillio = (body, toNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_NUMBER;
    if (!twilioAccountSid)
        throw new Error("Twilio Account SID is required.");
    if (!twilioAuthToken)
        throw new Error("Twilio Auth Token is required.");
    if (!twilioNumber)
        throw new Error("Twilio Number is required.");
    try {
        const client = (0, twilio_1.default)(twilioAccountSid, twilioAuthToken);
        const message = yield client.messages.create({
            body,
            from: twilioNumber,
            to: toNumber,
        });
        return message;
    }
    catch (err) {
        throw err;
    }
});
exports.twillio = twillio;
