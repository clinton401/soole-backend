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
exports.getPayoutYearlyOverview = void 0;
const payout_1 = require("../nobox/record-structures/payout");
const variables_1 = require("../lib/variables");
const getPayoutYearlyOverview = (validYear) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payouts = yield payout_1.PayoutModel.find({});
        if (!payouts) {
            throw new Error(variables_1.unknown_error);
        }
        const monthCounts = {
            january: 0,
            february: 0,
            march: 0,
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0
        };
        payouts.forEach(payout => {
            const createdAt = new Date(payout.createdAt);
            const year = createdAt.getFullYear();
            const monthIndex = createdAt.getMonth();
            if (year === validYear) {
                const monthNames = Object.keys(monthCounts);
                const monthName = monthNames[monthIndex];
                if (monthName) {
                    monthCounts[monthName] += payout.amount;
                }
            }
        });
        const monthCountsArray = Object.entries(monthCounts).map(([month, count]) => ({
            month,
            count,
        }));
        return monthCountsArray;
    }
    catch (error) {
        throw error;
    }
});
exports.getPayoutYearlyOverview = getPayoutYearlyOverview;
