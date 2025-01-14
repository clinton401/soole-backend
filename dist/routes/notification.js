"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controllers_1 = require("../controllers/notification-controllers");
const notification = (0, express_1.Router)();
notification.get("/", notification_controllers_1.getNotifications);
notification.put("/:id/read", notification_controllers_1.readNotifications);
exports.default = notification;
