import { Router } from "express";
import { login, register } from "../controllers/admin-auth-controllers";

const admin = Router();


admin.post("/login", login);
admin.post("/register", register);



export default admin