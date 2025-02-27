import {Router} from "express";
import {addPaymentMethod, deletePaymentMethod, getPaymentMethods, getUserDetails, updateUserDetails, resetPassword, deleteAccount, createComplaint} from "../controllers/user-controllers";

const user = Router();
user.get("/me", getUserDetails);
user.post("/me/complaint", createComplaint);
user.put("/me/update", updateUserDetails);
user.put("/me/update/password", resetPassword);
user.delete("/me/delete-account", deleteAccount);
user.get("/payment-methods", getPaymentMethods);
user.post("/payment-methods", addPaymentMethod);
user.delete("/payment-methods/:id", deletePaymentMethod);
export default user;