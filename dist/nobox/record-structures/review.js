"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = exports.ReviewStructure = void 0;
const config_1 = require("../config");
exports.ReviewStructure = {
    space: "Review",
    description: "A Record Space for Reviews",
    structure: {
        reviewerId: {
            description: "ID of the user leaving the review",
            required: true,
            type: String,
        },
        reviewerName: {
            description: "Full name of the reviewer",
            required: true,
            type: String,
        },
        reviewerUsername: {
            description: "Username of the reviewer",
            required: true,
            type: String,
        },
        reviewerImageUrl: {
            description: "Profile image URL of the reviewer",
            required: false,
            type: String,
        },
        driverId: {
            description: "ID of the driver being reviewed",
            required: true,
            type: String,
        },
        // rideId: {
        //   description: "ID of the ride this review is for",
        //   required: true,
        //   type: String,
        // },
        rating: {
            description: "Rating given to the driver (1-5)",
            required: true,
            type: Number,
        },
        comment: {
            description: "Optional review comment",
            required: false,
            type: String,
        },
    },
};
exports.ReviewModel = (0, config_1.createRowSchema)(exports.ReviewStructure);
