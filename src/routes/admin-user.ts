import {Router} from "express";
import {getAllUsersForAdmin, suspendUser, reactivateUser, searchForUser} from "../controllers/admin-user-controllers"

const adminUser = Router();

adminUser.get("/", getAllUsersForAdmin);
adminUser.get("/search", searchForUser);
adminUser.post("/:id/suspend", suspendUser);
adminUser.post("/:id/reactivate", reactivateUser);
export default adminUser;
