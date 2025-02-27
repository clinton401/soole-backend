import { UserModel } from "../nobox/record-structures/user";
import { unknown_error } from "../lib/variables";
import { calculateGrowth, getWeekNumber } from "../lib/utils"

export const getUserAnalytics = async (yesterday: string, today: string): Promise<{
    status: string;
    percentage: number;
    count: number
}> => {
    try {

        const [yesterdayUsers, todayUsers] = await Promise.all([
            UserModel.find({ analyticsDate: yesterday }),
            UserModel.find({ analyticsDate: today }),
        ]);

        if (!yesterdayUsers || !todayUsers) {
            throw new Error(unknown_error)
        }
        const yesterdayUsersCount = yesterdayUsers.length;
        const todayUsersCount = todayUsers.length;
        const usersGrowth = calculateGrowth(yesterdayUsersCount, todayUsersCount);

        return usersGrowth

    } catch (error) {
        throw error
    }
}
export const getUsersWeeklyGrowth = async(weeksAgo: number): Promise<{day: string, count: number}[]> => {
    try{
        const weekOfCreation = getWeekNumber(weeksAgo)
        const users = await UserModel.find({ weekOfCreation });
        if(!users){
            throw new Error(unknown_error)
        }
        const dayCounts: Record<string, number> = {
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
        return dayCountsArray
    }catch(error){
        throw error
    }
}