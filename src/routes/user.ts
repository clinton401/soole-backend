import {Router} from "express";
import {addPaymentMethod, deletePaymentMethod, getPaymentMethods} from "../controllers/user-controllers";

const user = Router();
user.get("/payment-methods", getPaymentMethods);
user.post("/payment-methods", addPaymentMethod);
user.delete("/payment-methods/:id", deletePaymentMethod);
export default user;