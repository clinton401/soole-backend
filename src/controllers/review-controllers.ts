import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { server_error, unauthorized_error, unknown_error } from "../lib/variables";
import { isValidNumber, paginationOptions } from "../lib/utils";
import { UserModel } from "../nobox/record-structures/user"
import { ReviewModel } from "../nobox/record-structures/review"
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    const { driverId, comment, rating } = req.body;
    const userId = req.userId;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }

    if (!driverId || !comment || !rating) {
        return next(createError(400, "All fields are required"))
    }

    if (comment.trim().length < 1) {
        return next(createError(400, "Comment shoud have at least one character"))
    }
    if (!isValidNumber(rating) || Number(rating) > 5) {
        return next(createError(400, "Make sure 'rating' is a number greater than or equal to 1 and less than 6."))
    }
    if (userId === driverId) {
        return next(createError(400, "You cannot leave a review for yourself."))
    }
    try {
        const [driver, reviewer] = await Promise.all([
            UserModel.findOne({ id: driverId }),
            UserModel.findOne({ id: userId })
        ])
        if (!driver) {
            return next(createError(404, "Driver not found"))
        }
        if (!reviewer) {
            return next(createError(404, "Reviewer not found"))
        }
        const { firstName, lastName, avatarUrl: reviewerImageUrl, username: reviewerUsername } = reviewer
        if (!firstName || !lastName || !reviewerImageUrl || !reviewerUsername) {
            return next(createError(400, "Your profile is incomplete. Please update your profile before leaving a review."))
        }
        const name = `${firstName} ${lastName}`
        const review = await ReviewModel.insertOne({
            comment,
            rating: Number(rating),
            driverId,
            reviewerId: userId,
            reviewerName: name,
            reviewerUsername,
            reviewerImageUrl
        })
        if (!review) {
            return next(createError(500, unknown_error))
        }

        res.status(201).json({
            status: "success",
            message: "Review created successfully",
            review
        })

    } catch (error) {
        console.error(`Error creating review: ${error}`);
        return next(createError(500, server_error))
    }
}

export const getDriverReviews = async (req: Request, res: Response, next: NextFunction) => {
    const driverId = req.params.driverId;

    try {
        const options = paginationOptions();
        const reviews = await ReviewModel.find({ driverId }, options);

        res.json({
            status: "success",
            message: "Reviews retrieved successfully",
            reviews
        })
    } catch (error) {
        console.error(`Unable to get driver reviews: ${error}`);
        return next(createError(500, server_error));
    }
} 