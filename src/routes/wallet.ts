import {Router} from "express";
import {userWalletFundingInitialization, createUserWallet, chargeUserSavedCard, verifyUserReference, getWallet, transferFunds} from "../controllers/wallet-controllers"
const wallet = Router();

wallet.post("/user/fund", userWalletFundingInitialization)
wallet.post("/create", createUserWallet)
wallet.post("/user/charge", chargeUserSavedCard)
wallet.get("/user/verify/:reference", verifyUserReference)
wallet.get("/", getWallet);
wallet.post("/transfer-funds", transferFunds)


export default wallet