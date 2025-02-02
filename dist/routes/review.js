"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controllers_1 = require("../controllers/review-controllers");
const review = (0, express_1.Router)();
review.post("/create", review_controllers_1.createReview);
review.get("/:driverId", review_controllers_1.getDriverReviews);
exports.default = review;
