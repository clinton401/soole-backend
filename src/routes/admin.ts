import {Router} from "express";
import { makeSuperAdmin, removeFromSuperAdmin, addNewAdmin, updateAdminProfile, resetAdminPassword, getAdminDetails } from "../controllers/admin-controllers";
const admin = Router();

admin.patch("/super-admin/:id/promote", makeSuperAdmin);
admin.patch("/super-admin/:id/demote", removeFromSuperAdmin);
admin.post("/create", addNewAdmin);
admin.put("/me/update", updateAdminProfile);
admin.patch("/me/update/password", resetAdminPassword);
admin.get("/me", getAdminDetails);

export default admin;