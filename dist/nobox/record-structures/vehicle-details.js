"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleImageModel = exports.VehicleImageStructure = void 0;
const config_1 = require("../config");
exports.VehicleImageStructure = {
    space: "Vehicle-Image",
    description: "A Record Space for vehicle images",
    structure: {
        url: {
            description: "Vehicle Image URL",
            type: String,
            required: true
        },
        publicId: {
            description: "Vehicle Public ID",
            required: true,
            type: String,
        },
        tripId: {
            description: "ID of the trip",
            required: true,
            type: String,
        },
    }
};
exports.VehicleImageModel = (0, config_1.createRowSchema)(exports.VehicleImageStructure);
