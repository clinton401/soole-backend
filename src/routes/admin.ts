import {Router} from "express";
import { makeSuperAdmin, removeFromSuperAdmin, addNewAdmin, updateAdminProfile, resetAdminPassword, getAdminDetails, getAnalytics, getUsersAnalytics, getRevenueOverview, deleteAdminProfilePicture } from "../controllers/admin-controllers";
const admin = Router();

admin.patch("/:id/super-admin/promote", makeSuperAdmin);
admin.patch("/:id/super-admin/demote", removeFromSuperAdmin);
admin.post("/create", addNewAdmin);
admin.put("/me/update", updateAdminProfile);
// admin.delete("/me/profile-picture", deleteAdminProfilePicture);
admin.patch("/me/update/password", resetAdminPassword);
admin.get("/me", getAdminDetails);
admin.get("/analytics", getAnalytics);
admin.get("/analytics/users", getUsersAnalytics);
admin.get("/analytics/revenue", getRevenueOverview);

export default admin;