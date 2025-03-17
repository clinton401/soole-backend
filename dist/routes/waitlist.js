"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const waitlist_controllers_1 = require("../controllers/waitlist-controllers");
const waitlist = (0, express_1.Router)();
waitlist.post("/join", waitlist_controllers_1.joinWaitlist);
exports.default = waitlist;
