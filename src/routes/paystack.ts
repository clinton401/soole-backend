import {Router} from "express";
import { paystackWebhook } from "../controllers/paystack-controllers";
const paystack = Router();

paystack.post("/webhook", paystackWebhook)

export default paystack