import {Router} from "express"
import auth from "./routes/auth";
import ride from "./routes/ride";
import user from "./routes/user";
import {
  isAuthenticated,
  verifyAccessToken,
} from "./middlewares/access-tokens";
import {uploadImage} from "./controllers/auth-controllers";
import upload from "./middlewares/upload"
import notification from "./routes/notification";
import conversation from "./routes/conversation";
import paystack from "./routes/paystack";
import wallet from "./routes/wallet";
import transaction from "./routes/transaction";
import review from "./routes/review";
import payout from "./routes/payout";
import admin from "./routes/admin";
import adminAuth from "./routes/admin-auth";
import adminRides from "./routes/admin-ride";
import adminUser from "./routes/admin-user";
import adminRequest from "./routes/admin-request";
import adminComplaint from "./routes/admin-complaint";
import {verifyUserStatus} from "./middlewares/user"
import { checkSuperAdmin } from "./middlewares/admins";
const api = Router();

api.use("/auth", isAuthenticated, auth);
api.use("/rides", verifyAccessToken, verifyUserStatus, ride);
api.use("/user", verifyAccessToken, verifyUserStatus, user);
api.use("/notifications", verifyAccessToken, verifyUserStatus,  notification);
api.use("/conversations", verifyAccessToken, verifyUserStatus,  conversation);
api.use("/paystack", paystack);
api.use("/wallet", verifyAccessToken, verifyUserStatus, wallet);
api.use("/transactions", verifyAccessToken, verifyUserStatus , transaction);
api.use("/reviews", verifyAccessToken, verifyUserStatus, review);
api.use("/payout", verifyAccessToken, verifyUserStatus, payout);
api.post("/upload-images",upload.single('image'),  uploadImage)



// Admin routes 


api.use("/admin/auth", isAuthenticated, adminAuth);
api.use("/admin/rides", verifyAccessToken, adminRides);
api.use("/admin/users", verifyAccessToken, adminUser);
api.use("/admin/complaints", verifyAccessToken, adminComplaint);
api.use("/admin/requests", verifyAccessToken, checkSuperAdmin, adminRequest);
api.use("/admin", verifyAccessToken, admin);
export default api