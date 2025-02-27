"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = exports.verifyAccessToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const generateAccessToken = (id) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN;
    if (!secret || !expiresIn) {
        throw new Error("JWT secret and expire time are required");
    }
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn });
};
exports.generateAccessToken = generateAccessToken;
const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next((0, http_errors_1.default)(401, "Access denied. No token provided."));
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("No JWT Secret provided");
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return next((0, http_errors_1.default)(401, "Token has expired. Please log in again."));
        }
        return next((0, http_errors_1.default)(401, "Access denied. Invalid token"));
    }
};
exports.verifyAccessToken = verifyAccessToken;
const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("No JWT Secret provided");
            return next((0, http_errors_1.default)(500, variables_1.server_error));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            req.userId = decoded.id;
            return next((0, http_errors_1.default)(400, "You are already logged in."));
        }
        catch (error) {
            next();
        }
    }
    else {
        next();
    }
};
exports.isAuthenticated = isAuthenticated;
