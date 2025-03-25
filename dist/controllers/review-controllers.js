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
exports.getDriverReviews = exports.createReview = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const utils_1 = require("../lib/utils");
const user_1 = require("../nobox/record-structures/user");
const review_1 = require("../nobox/record-structures/review");
const createReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { driverId, comment, rating } = req.body;
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    if (!driverId || !comment || !rating) {
        return next((0, http_errors_1.default)(400, "All fields are required"));
    }
    if (comment.trim().length < 1) {
        return next((0, http_errors_1.default)(400, "Comment shoud have at least one character"));
    }
    if (!(0, utils_1.isValidNumber)(rating) || Number(rating) > 5) {
        return next((0, http_errors_1.default)(400, "Make sure 'rating' is a number greater than or equal to 1 and less than 6."));
    }
    if (userId === driverId) {
        return next((0, http_errors_1.default)(400, "You cannot leave a review for yourself."));
    }
    try {
        const [driver, reviewer] = yield Promise.all([
            user_1.UserModel.findOne({ id: driverId }),
            user_1.UserModel.findOne({ id: userId })
        ]);
        if (!driver) {
            return next((0, http_errors_1.default)(404, "Driver not found"));
        }
        if (!reviewer) {
            return next((0, http_errors_1.default)(404, "Reviewer not found"));
        }
        const { firstName, lastName, avatarUrl: reviewerImageUrl, username: reviewerUsername } = reviewer;
        if (!firstName || !lastName || !reviewerImageUrl || !reviewerUsername) {
            return next((0, http_errors_1.default)(400, "Your profile is incomplete. Please update your profile before leaving a review."));
        }
        const name = `${firstName} ${lastName}`;
        const review = yield review_1.ReviewModel.insertOne({
            comment,
            rating: Number(rating),
            driverId,
            reviewerId: userId,
            reviewerName: name,
            reviewerUsername,
            reviewerImageUrl
        });
        if (!review) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        res.status(201).json({
            status: "success",
            message: "Review created successfully",
            review
        });
    }
    catch (error) {
        console.error(`Error creating review: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.createReview = createReview;
const getAverageRating = (reviews) => {
    if (reviews.length === 0)
        return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
};
const getDriverReviews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    const driverId = req.params.driverId;
    const currentPage = Math.max(1, Number(page) || 1);
    try {
        const options = (0, utils_1.paginationOptions)();
        const reviews = yield review_1.ReviewModel.find({ driverId }, options);
        if (!reviews) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const averageRating = getAverageRating(reviews);
        const pageSize = 15;
        const data = (0, utils_1.getUserPageInfo)(reviews, pageSize, currentPage, "reviews");
        res.json({
            status: "success",
            message: "Reviews retrieved successfully",
            data: Object.assign(Object.assign({}, data), { averageRating })
        });
    }
    catch (error) {
        console.error(`Unable to get driver reviews: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getDriverReviews = getDriverReviews;
