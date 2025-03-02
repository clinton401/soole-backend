"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchForRides = exports.getAllRidesForAdmin = void 0;
const ride_1 = require("../nobox/record-structures/ride");
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const utils_1 = require("../lib/utils");
const getAllRidesForAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter, page } = req.query;
    const validFilters = ['active', 'completed', 'cancelled', "ongoing"];
    const selectedFilter = validFilters.includes(filter === null || filter === void 0 ? void 0 : filter.toLowerCase()) ? filter.toLowerCase() : null;
    const filterVariable = selectedFilter === null || selectedFilter === void 0 ? void 0 : selectedFilter.toUpperCase();
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;
    const options = (0, utils_1.adminPaginationOptions)(currentPage, pageSize);
    try {
        let rides = [];
        if (filterVariable) {
            rides = yield ride_1.rideModel.find({
                status: filterVariable
            }, options);
        }
        else {
            rides = yield ride_1.rideModel.find({ adminViewable: true }, options);
        }
        if (!rides) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const { totalLength: totalRides, totalPages, nextPage, prevPage, filteredData } = (0, utils_1.getPageInfo)(rides, pageSize, currentPage);
        res.json({
            status: "success",
            message: "Rides found successfully",
            data: {
                rides: filteredData,
                totalRides,
                totalPages,
                currentPage,
                nextPage,
                prevPage
            }
        });
    }
    catch (error) {
        console.error(`Unable to get all rides for admin: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getAllRidesForAdmin = getAllRidesForAdmin;
const searchForRides = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { query, page, filter } = req.query;
    if (!query || query.length < 1) {
        return next((0, http_errors_1.default)(400, "Search query is required and must be at least 1 character long."));
    }
    const validFilters = ['active', 'completed', 'cancelled', "ongoing"];
    const selectedFilter = validFilters.includes(filter === null || filter === void 0 ? void 0 : filter.toLowerCase()) ? filter.toLowerCase() : "active";
    const filterVariable = selectedFilter.toUpperCase();
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;
    const options = (0, utils_1.adminPaginationOptions)(currentPage, pageSize);
    try {
        const rides = yield ride_1.rideModel.find({ adminViewable: true }, options);
        if (!rides) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        // console.log({filterVariable, rides})    
        const validRides = rides.filter(ride => {
            const { userFirstName, userLastName, userEmail, userUsername, status } = ride;
            if (!userFirstName || !userLastName || !userEmail || !userUsername) {
                return false;
            }
            const matchesStatus = status === filterVariable;
            const matchesQuery = [userFirstName, userLastName, userEmail, userUsername]
                .some(field => field.toLowerCase().includes(query.toLowerCase()));
            return matchesStatus && matchesQuery;
        });
        res.json({
            status: "success",
            message: "Rides found successfully",
            data: {
                rides: validRides.slice(0, pageSize)
            }
        });
    }
    catch (error) {
        console.error(`Unable to search for rides by admin: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.searchForRides = searchForRides;
