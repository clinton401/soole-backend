"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.foundError = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const utils_1 = require("../lib/utils");
const variables_1 = require("../lib/variables");
const foundError = (err, req, res, next) => {
    console.error(err);
    const msg = err.message || variables_1.server_error;
    const status = err.status || 500;
    res
        .status(err.status || 500)
        .json((0, utils_1.errorHandler)(msg, status));
};
exports.foundError = foundError;
const notFound = (req, res, next) => {
    return next((0, http_errors_1.default)(404, "No route matches your request"));
};
exports.notFound = notFound;
