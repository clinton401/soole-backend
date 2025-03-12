import {Router} from "express";
import {addPaymentMethod, deletePaymentMethod, getPaymentMethods, getUserDetails, updateUserDetails, resetPassword, deleteAccount, createComplaint, getSpecificUserDetails} from "../controllers/user-controllers";

const user = Router();
user.get("/me", getUserDetails);
user.post("/me/complaint", createComplaint);
user.put("/me/update", updateUserDetails);
user.put("/me/update/password", resetPassword);
user.delete("/me/delete-account", deleteAccount);
user.get("/me/payment-methods", getPaymentMethods);
user.post("/me/payment-methods", addPaymentMethod);
user.delete("/me/payment-methods/:id", deletePaymentMethod);
user.get("/:id", getSpecificUserDetails);



export default user;