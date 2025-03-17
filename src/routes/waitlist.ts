import {Router} from "express";
import {joinWaitlist} from "../controllers/waitlist-controllers"

const waitlist = Router();


waitlist.post("/join", joinWaitlist)

export default waitlist