"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nobox = exports.createKeyGroupSchema = exports.createRowSchema = exports.config = void 0;
const nobox_client_1 = require("nobox-client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const token = process.env.NOBOX_TOKEN;
const endpoint = process.env.NOBOX_ENDPOINT;
if (!token || !endpoint) {
    throw new Error("Nobox Accesstoken and Endpoint are required");
}
exports.config = {
    endpoint,
    project: "soole",
    token,
};
exports.createRowSchema = (0, nobox_client_1.getSchemaCreator)(exports.config, { type: "rowed" });
exports.createKeyGroupSchema = (0, nobox_client_1.getSchemaCreator)(exports.config, { type: "key-group" });
exports.Nobox = (0, nobox_client_1.getFunctions)(exports.config);
