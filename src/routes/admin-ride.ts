import {Router} from "express";
import {getAllRidesForAdmin} from "../controllers/admin-rides-controllers"
const adminRides = Router();

adminRides.get("/", getAllRidesForAdmin)

export default adminRides;