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
const api = Router();

api.use("/auth", isAuthenticated, auth);
api.use("/rides", verifyAccessToken, ride);
api.use("/user", verifyAccessToken, user);
api.use("/notifications", verifyAccessToken, notification);
api.use("/conversations", verifyAccessToken, conversation);
api.use("/paystack", paystack);
api.use("/wallet", verifyAccessToken, wallet);
api.use("/transactions", verifyAccessToken, transaction);
api.use("/reviews", verifyAccessToken, review);
api.use("/payout", verifyAccessToken, payout);
api.post("/upload-images",upload.single('image'),  uploadImage)

export default api