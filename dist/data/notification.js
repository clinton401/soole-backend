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
exports.createNotification = void 0;
const notification_1 = require("../nobox/record-structures/notification");
const variables_1 = require("../lib/variables");
const __1 = require("..");
const createNotification = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield notification_1.NotificationModel.insertOne(data);
        if (!notification) {
            throw new Error(variables_1.unknown_error);
        }
        __1.io.emit("notifications", notification);
        return notification;
    }
    catch (error) {
        throw error;
    }
});
exports.createNotification = createNotification;
