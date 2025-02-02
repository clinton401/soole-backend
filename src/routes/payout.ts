import {Router} from "express";
import { getDriverPayouts } from "../controllers/payout-controllers";

const payout = Router();

payout.get("/", getDriverPayouts)

export default payout