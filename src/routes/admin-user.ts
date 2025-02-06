import {Router} from "express";
import {getAllUsersForAdmin, suspendUser, reactivateUser} from "../controllers/admin-user-controllers"

const adminUser = Router();

adminUser.get("/", getAllUsersForAdmin);
adminUser.post("/:id/suspend", suspendUser);
adminUser.post("/:id/reactivate", reactivateUser);
export default adminUser;