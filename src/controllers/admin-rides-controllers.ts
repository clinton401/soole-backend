import { Request, Response, NextFunction } from "express";
import { rideModel, Ride } from "../nobox/record-structures/ride";
import createError from "http-errors";
import { server_error, unauthorized_error, unknown_error } from "../lib/variables"
import { getPageInfo, adminPaginationOptions } from "../lib/utils"




export const getAllRidesForAdmin = async (req: Request, res: Response, next: NextFunction) => {

    const { filter, page } = req.query as {
        filter: string,
        page?: string
    };

    const validFilters = ['active', 'completed', 'cancelled', "ongoing"];
    const selectedFilter = validFilters.includes(filter?.toLowerCase()) ? filter.toLowerCase() : null;

    type Status = "ACTIVE" | "CANCELLED" | "COMPLETED" | "ONGOING"

    const filterVariable = selectedFilter?.toUpperCase() as Status | null;
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;
    const options = adminPaginationOptions(currentPage, pageSize);
   
    try {

        let rides: Ride[] = []
        if (filterVariable) {
            rides = await rideModel.find({

                status: filterVariable
            }, options)
        } else {

            rides = await rideModel.find({ adminViewable: true }, options);
        }
        if(!rides) {
            return next(createError(500, unknown_error))
        }
       const {totalLength: totalRides, totalPages, nextPage }  = getPageInfo(rides, pageSize, currentPage)
        
        res.json({
            status: "success",
            message: "Rides found successfully",
            data: {
                rides,
                totalRides,
                totalPages,
                currentPage,
                nextPage
            }
        })

    } catch (error) {
        console.error(`Unable to get all rides for admin: ${error}`);
        return next(createError(500, server_error))
    }
}