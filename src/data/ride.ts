import { rideModel, Ride } from "../nobox/record-structures/ride";
import { unknown_error } from "../lib/variables";
import { calculateGrowth } from "../lib/utils"




export const getActiveRidesAnalytics = (yesterday: Ride[], today: Ride[]) => {
    const yesterdayActiveRides = yesterday.filter(ride => {
        return ride.status === "ACTIVE"
    })
    const todayActiveRides = today.filter(ride => {
        return ride.status === "ACTIVE"
    })
    const yesterdayRidesCount = yesterdayActiveRides.length;
        const todayRidesCount = todayActiveRides.length;
        const activeRidesGrowth = calculateGrowth(yesterdayRidesCount, todayRidesCount);
        return activeRidesGrowth
}
export const getCompletedRidesAnalytics = (yesterday: Ride[], today: Ride[]) => {
    const yesterdayCompletedRides = yesterday.filter(ride => {
        return ride.status === "COMPLETED"
    })
    const todayCompletedRides = today.filter(ride => {
        
        return ride.status === "COMPLETED"
    })
    const yesterdayRidesCount = yesterdayCompletedRides.length;
        const todayRidesCount = todayCompletedRides.length;
        const completedRidesGrowth = calculateGrowth(yesterdayRidesCount, todayRidesCount);
        return completedRidesGrowth
}

export const getRideAnalytics = async (yesterday: string, today: string) => {
    try {

        const [yesterdayRides, todayRides] = await Promise.all([
            rideModel.find({ analyticsDate: yesterday }),
            rideModel.find({ analyticsDate: today }),
        ]);

        if (!yesterdayRides || !todayRides) {
            throw new Error(unknown_error)
        }
        const yesterdayRidesCount = yesterdayRides.length;
        const todayRidesCount = todayRides.length;
        const totalRidesGrowth = calculateGrowth(yesterdayRidesCount, todayRidesCount);
        const activeRidesGrowth = getActiveRidesAnalytics(yesterdayRides, todayRides);
        const completedRidesGrowth = getCompletedRidesAnalytics(yesterdayRides, todayRides);

        return {totalRidesGrowth, activeRidesGrowth, completedRidesGrowth}

    } catch (error) {
        throw error
    }
}
