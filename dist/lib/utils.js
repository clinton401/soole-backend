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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSufficientBalance = exports.paginationOptions = exports.hasDecimal = exports.isValidNumber = exports.hasAtLeastOneProperty = exports.zodErrorHandler = exports.validateExpiryDate = exports.isCreditCardValid = exports.validateEmail = exports.validateDOB = exports.validatePhone = exports.userHandler = exports.hasExpired = exports.otpGenerator = exports.errorHandler = void 0;
const validator_1 = __importDefault(require("validator"));
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
const validateDOB = (dob) => {
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    return dobRegex.test(dob);
};
exports.validateDOB = validateDOB;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const isCreditCardValid = (cardNumber) => {
    return validator_1.default.isCreditCard(cardNumber);
};
exports.isCreditCardValid = isCreditCardValid;
const validateExpiryDate = (expiryDate) => {
    const [month, year] = expiryDate.split('/').map(Number);
    if (!month || !year || month < 1 || month > 12) {
        return 'Invalid expiry date format. Use MM/YY.';
    }
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return 'The expiry date is in the past.';
    }
    return;
};
exports.validateExpiryDate = validateExpiryDate;
const zodErrorHandler = (err) => {
    const errors = err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
    }));
    return errors;
};
exports.zodErrorHandler = zodErrorHandler;
const hasAtLeastOneProperty = (obj) => {
    return Object.keys(obj).length > 0;
};
exports.hasAtLeastOneProperty = hasAtLeastOneProperty;
function isValidNumber(value) {
    const parsed = Number(value);
    return !isNaN(parsed) && parsed >= 1;
}
exports.isValidNumber = isValidNumber;
const hasDecimal = (num) => !Number.isInteger(num);
exports.hasDecimal = hasDecimal;
const paginationOptions = (order = "desc") => {
    const options = {
        pagination: {
            limit: 25,
            page: 1,
        },
        sort: {
            by: "createdAt",
            order,
        },
    };
    return options;
};
exports.paginationOptions = paginationOptions;
const hasSufficientBalance = (balance, rideCost) => {
    return balance >= rideCost;
};
exports.hasSufficientBalance = hasSufficientBalance;
