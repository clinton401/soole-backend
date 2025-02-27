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
exports.getUsersWeeklyGrowth = exports.getUserAnalytics = void 0;
const user_1 = require("../nobox/record-structures/user");
const variables_1 = require("../lib/variables");
const utils_1 = require("../lib/utils");
const getUserAnalytics = (yesterday, today) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [yesterdayUsers, todayUsers] = yield Promise.all([
            user_1.UserModel.find({ analyticsDate: yesterday }),
            user_1.UserModel.find({ analyticsDate: today }),
        ]);
        if (!yesterdayUsers || !todayUsers) {
            throw new Error(variables_1.unknown_error);
        }
        const yesterdayUsersCount = yesterdayUsers.length;
        const todayUsersCount = todayUsers.length;
        const usersGrowth = (0, utils_1.calculateGrowth)(yesterdayUsersCount, todayUsersCount);
        return usersGrowth;
    }
    catch (error) {
        throw error;
    }
});
exports.getUserAnalytics = getUserAnalytics;
const getUsersWeeklyGrowth = (weeksAgo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const weekOfCreation = (0, utils_1.getWeekNumber)(weeksAgo);
        const users = yield user_1.UserModel.find({ weekOfCreation });
        if (!users) {
            throw new Error(variables_1.unknown_error);
        }
        const dayCounts = {
            sunday: 0,
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0
        };
        users.forEach(user => {
            const day = user.dayOfCreation.toLowerCase();
            if (dayCounts[day] !== undefined) {
                dayCounts[day]++;
            }
        });
        const dayCountsArray = Object.entries(dayCounts).map(([day, count]) => ({
            day,
            count,
        }));
        return dayCountsArray;
    }
    catch (error) {
        throw error;
    }
});
exports.getUsersWeeklyGrowth = getUsersWeeklyGrowth;
