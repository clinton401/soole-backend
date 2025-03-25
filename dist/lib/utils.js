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
exports.isPastDate = exports.isWithinTwoDays = exports.isValidImage = exports.getMonthName = exports.getDayOfWeek = exports.getWeekNumber = exports.getDates = exports.calculateGrowth = exports.dateToInt = exports.hasSufficientBalance = exports.getPageInfo = exports.getUserPageInfo = exports.adminPaginationOptions = exports.paginationOptions = exports.hasDecimal = exports.isValidNumber = exports.hasAtLeastOneProperty = exports.zodErrorHandler = exports.validateExpiryDate = exports.isCreditCardValid = exports.validateEmail = exports.validateDOB = exports.validatePhone = exports.userHandler = exports.hasExpired = exports.otpGenerator = exports.errorHandler = void 0;
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
    const code = generateRandomNumbers();
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
const paginationOptions = (order = "desc", by = "createdAt") => {
    const options = {
        // pagination: {
        //   limit,
        //   page: currentPage,
        // },
        sort: {
            by,
            order,
        },
    };
    return options;
};
exports.paginationOptions = paginationOptions;
const adminPaginationOptions = (page, limit, order = "desc") => {
    return {
        // pagination: {
        //     limit,
        //     page,
        // },
        sort: {
            by: "createdAt",
            order,
        },
    };
};
exports.adminPaginationOptions = adminPaginationOptions;
const getUserPageInfo = (data, pageSize, currentPage, name) => {
    const totalLength = data.length;
    const totalPages = Math.ceil(totalLength / pageSize);
    const sliceStart = pageSize * (currentPage - 1);
    const sliceEnd = sliceStart + pageSize;
    const filteredData = data.slice(sliceStart, sliceEnd);
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;
    return {
        [name]: filteredData,
        totalLength,
        totalPages,
        nextPage,
        prevPage
    };
};
exports.getUserPageInfo = getUserPageInfo;
const getPageInfo = (data, pageSize, currentPage) => {
    const totalLength = data.length;
    const totalPages = Math.ceil(totalLength / pageSize);
    const sliceStart = pageSize * (currentPage - 1);
    const sliceEnd = sliceStart + pageSize;
    const filteredData = data.slice(sliceStart, sliceEnd);
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;
    return {
        filteredData,
        totalLength,
        totalPages,
        nextPage,
        prevPage
    };
};
exports.getPageInfo = getPageInfo;
const hasSufficientBalance = (balance, rideCost) => {
    return balance >= rideCost;
};
exports.hasSufficientBalance = hasSufficientBalance;
const dateToInt = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return String(parseInt(`${year}${month}${day}`, 10));
};
exports.dateToInt = dateToInt;
const calculateGrowth = (yesterday, today) => {
    if (yesterday === today) {
        return { status: "draw", percentage: 0, count: today };
    }
    const difference = today - yesterday;
    const percentageChange = yesterday === 0
        ? today * 100
        : Math.abs((difference / yesterday) * 100);
    return {
        status: today > yesterday ? "increase" : "decrease",
        percentage: parseFloat(percentageChange.toFixed(2)),
        count: today
    };
};
exports.calculateGrowth = calculateGrowth;
const getDates = () => {
    const todayDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const today = String((0, exports.dateToInt)(todayDate));
    const yesterday = String((0, exports.dateToInt)(yesterdayDate));
    return { yesterday, today };
};
exports.getDates = getDates;
const getWeekNumber = (weeksAgo = 0) => {
    const today = new Date();
    today.setDate(today.getDate() - 7 * weeksAgo);
    const tempDate = new Date(today);
    tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
    const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
    firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
    const diff = Math.round((tempDate.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return String(diff + 1);
};
exports.getWeekNumber = getWeekNumber;
const getDayOfWeek = (date = new Date()) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[date.getDay()];
};
exports.getDayOfWeek = getDayOfWeek;
const getMonthName = (date = new Date()) => {
    const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];
    return months[date.getMonth()];
};
exports.getMonthName = getMonthName;
const isValidImage = (filename) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(filename);
};
exports.isValidImage = isValidImage;
const isWithinTwoDays = (rideDate, requestDate) => {
    const rideDateObj = new Date(rideDate);
    if (isNaN(rideDateObj.getTime()))
        return false;
    const diffInDays = Math.abs((rideDateObj.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 2;
};
exports.isWithinTwoDays = isWithinTwoDays;
const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
};
exports.isPastDate = isPastDate;
