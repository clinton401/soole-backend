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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRideAnalytics = exports.getCompletedRidesAnalytics = exports.getActiveRidesAnalytics = void 0;
const ride_1 = require("../nobox/record-structures/ride");
const variables_1 = require("../lib/variables");
const utils_1 = require("../lib/utils");
const getActiveRidesAnalytics = (yesterday, today) => {
    const yesterdayActiveRides = yesterday.filter(ride => {
        return ride.status === "ACTIVE";
    });
    const todayActiveRides = today.filter(ride => {
        return ride.status === "ACTIVE";
    });
    const yesterdayRidesCount = yesterdayActiveRides.length;
    const todayRidesCount = todayActiveRides.length;
    const activeRidesGrowth = (0, utils_1.calculateGrowth)(yesterdayRidesCount, todayRidesCount);
    return activeRidesGrowth;
};
exports.getActiveRidesAnalytics = getActiveRidesAnalytics;
const getCompletedRidesAnalytics = (yesterday, today) => {
    const yesterdayCompletedRides = yesterday.filter(ride => {
        return ride.status === "COMPLETED";
    });
    const todayCompletedRides = today.filter(ride => {
        return ride.status === "COMPLETED";
    });
    const yesterdayRidesCount = yesterdayCompletedRides.length;
    const todayRidesCount = todayCompletedRides.length;
    const completedRidesGrowth = (0, utils_1.calculateGrowth)(yesterdayRidesCount, todayRidesCount);
    return completedRidesGrowth;
};
exports.getCompletedRidesAnalytics = getCompletedRidesAnalytics;
const getRideAnalytics = (yesterday, today) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [yesterdayRides, todayRides] = yield Promise.all([
            ride_1.rideModel.find({ analyticsDate: yesterday }),
            ride_1.rideModel.find({ analyticsDate: today }),
        ]);
        if (!yesterdayRides || !todayRides) {
            throw new Error(variables_1.unknown_error);
        }
        const yesterdayRidesCount = yesterdayRides.length;
        const todayRidesCount = todayRides.length;
        const totalRidesGrowth = (0, utils_1.calculateGrowth)(yesterdayRidesCount, todayRidesCount);
        const activeRidesGrowth = (0, exports.getActiveRidesAnalytics)(yesterdayRides, todayRides);
        const completedRidesGrowth = (0, exports.getCompletedRidesAnalytics)(yesterdayRides, todayRides);
        return { totalRidesGrowth, activeRidesGrowth, completedRidesGrowth };
    }
    catch (error) {
        throw error;
    }
});
exports.getRideAnalytics = getRideAnalytics;
