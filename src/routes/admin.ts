import {Router} from "express";
import { makeSuperAdmin, removeFromSuperAdmin, addNewAdmin, updateAdminProfile, resetAdminPassword, getAdminDetails } from "../controllers/admin-controllers";
const admin = Router();

admin.patch("/:id/super-admin/promote", makeSuperAdmin);
admin.patch("/:id/super-admin/demote", removeFromSuperAdmin);
admin.post("/create", addNewAdmin);
admin.put("/me/update", updateAdminProfile);
admin.patch("/me/update/password", resetAdminPassword);
admin.get("/me", getAdminDetails);
// admin.get("/analytics", getAnalytics);

export default admin;