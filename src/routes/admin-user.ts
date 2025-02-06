import {Router} from "express";
import {getAllUsersForAdmin} from "../controllers/admin-user-controllers"

const adminUser = Router();

adminUser.get("/", getAllUsersForAdmin)
export default adminUser;