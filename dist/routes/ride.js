"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ride_controller_1 = require("../controllers/ride-controller");
const ride = (0, express_1.Router)();
ride.post("/create", ride_controller_1.createRide);
ride.get("/search", ride_controller_1.searchRides);
exports.default = ride;
