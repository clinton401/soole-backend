"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = exports.validatePhone = exports.userHandler = exports.hasExpired = exports.otpGenerator = exports.errorHandler = void 0;
const errorHandler = (error, code) => {
    return {
        error,
        code
    };
};
exports.errorHandler = errorHandler;
const generateRandomNumbers = (numLength = 5) => {
    const availableNumbers = "0123456789";
    let randomNumbers = "";
    for (let i = 0; i < numLength; i++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        randomNumbers += availableNumbers[randomIndex];
    }
    return randomNumbers;
};
const otpGenerator = (is1Hr = false) => {
    const code = "00000";
    const additionNumber = !is1Hr ? 600000 : 3600000;
    const expiresAt = new Date(Date.now() + additionNumber);
    return { code, expiresAt };
};
exports.otpGenerator = otpGenerator;
const hasExpired = (expiresAt) => {
    return expiresAt < new Date();
};
exports.hasExpired = hasExpired;
const userHandler = (user) => {
    const { password } = user, cleanedUser = __rest(user, ["password"]);
    return cleanedUser;
};
exports.userHandler = userHandler;
const validatePhone = (phone) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
};
exports.validatePhone = validatePhone;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
