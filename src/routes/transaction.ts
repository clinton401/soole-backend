import {Router} from "express";
import {getTransactions} from "../controllers/transaction-controllers";
const transaction = Router();
transaction.get("/", getTransactions)

export default transaction;