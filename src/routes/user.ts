import {Router} from "express";
import {addPaymentMethod, deletePaymentMethod, getPaymentMethods, getUserDetails, updateUserDetails} from "../controllers/user-controllers";

const user = Router();
user.get("/me", getUserDetails);
user.put("/me/update", updateUserDetails);
user.get("/payment-methods", getPaymentMethods);
user.post("/payment-methods", addPaymentMethod);
user.delete("/payment-methods/:id", deletePaymentMethod);
export default user;