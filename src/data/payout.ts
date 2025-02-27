import {PayoutModel, PayoutType} from "../nobox/record-structures/payout";
import { unknown_error } from "../lib/variables";



export const getPayoutYearlyOverview = async(validYear: number) => {
    try{
        const payouts = await PayoutModel.find({ adminViewable: true });
        if(!payouts){
            throw new Error(unknown_error)
        }
        const monthCounts: Record<string, number> = {
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
        return monthCountsArray
    }catch(error){
        throw error
    }
}