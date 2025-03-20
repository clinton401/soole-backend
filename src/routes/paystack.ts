import {Router} from "express";
import { paystackWebhook, getBanks } from "../controllers/paystack-controllers";
const paystack = Router();

paystack.post("/webhook", paystackWebhook);
paystack.get("/banks", getBanks);

export default paystack