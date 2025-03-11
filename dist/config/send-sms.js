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
exports.sendSMS = void 0;
const variables_1 = require("../config/variables");
const axios_1 = __importDefault(require("axios"));
const variables_2 = require("../lib/variables");
const sendSMS = (message, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield axios_1.default.post("https://v3.api.termii.com/api/sms/send", {
            to: phoneNumber,
            from: variables_1.TERMII_SENDER_ID,
            sms: message,
            type: "plain",
            api_key: variables_1.TERMII_API_KEY,
            channel: "dnd",
        }, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.code) === "ok") {
            return response === null || response === void 0 ? void 0 : response.data;
        }
        else {
            throw new Error(variables_2.unknown_error);
        }
    }
    catch (error) {
        console.error(`Unable to send SMS: ${error}`);
        // throw error;
    }
});
exports.sendSMS = sendSMS;
