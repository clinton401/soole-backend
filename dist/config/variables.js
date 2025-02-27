"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOBOX_UPLOAD_URL = exports.NOBOX_PROJECT = exports.NOBOX_ENDPOINT = exports.NOBOX_TOKEN = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const getEnvVariable = (key) => {
    const value = process.env[key];
    if (!value)
        throw new Error(`Missing environment variable: ${key}`);
    return value;
};
exports.NOBOX_TOKEN = getEnvVariable("NOBOX_TOKEN");
exports.NOBOX_ENDPOINT = getEnvVariable("NOBOX_ENDPOINT");
exports.NOBOX_PROJECT = getEnvVariable("NOBOX_PROJECT");
exports.NOBOX_UPLOAD_URL = getEnvVariable("NOBOX_UPLOAD_URL");
