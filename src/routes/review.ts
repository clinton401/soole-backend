import {Router} from "express";
import {createReview, getDriverReviews} from "../controllers/review-controllers"
const review = Router();

review.post("/create", createReview)
review.get("/:driverId", getDriverReviews)


export default review