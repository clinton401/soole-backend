import {Router} from "express";
import {getAllRidesForAdmin, searchForRides} from "../controllers/admin-rides-controllers"
const adminRides = Router();

adminRides.get("/", getAllRidesForAdmin)
adminRides.get("/search", searchForRides)

export default adminRides;