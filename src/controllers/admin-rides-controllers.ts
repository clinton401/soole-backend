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
        if (!rides) {
            return next(createError(500, unknown_error))
        }
        
        const { totalLength: totalRides, totalPages, nextPage, prevPage, filteredData } = getPageInfo(rides, pageSize, currentPage)

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
        })

    } catch (error) {
        console.error(`Unable to get all rides for admin: ${error}`);
        return next(createError(500, server_error))
    }
}


export const searchForRides = async (req: Request, res: Response, next: NextFunction) => {
    const { query, page, filter } = req.query as {
        query?: string;
        page?: string,
        filter: string
    };
    if(!query || query.length < 1) {
        return next(createError(400, "Search query is required and must be at least 1 character long."))
    }
    
    const validFilters = ['active', 'completed', 'cancelled', "ongoing"];
    const selectedFilter = validFilters.includes(filter?.toLowerCase()) ? filter.toLowerCase() : null;

    type Status = "ACTIVE" | "CANCELLED" | "COMPLETED" | "ONGOING"

    const filterVariable = selectedFilter?.toUpperCase() as Status || null;
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;
    const options = adminPaginationOptions(currentPage, pageSize);

    try{
        const rides = await rideModel.find({ adminViewable: true }, options);
        if(!rides){
            return next(createError(500, unknown_error))
        }
       
// console.log({filterVariable, rides})    
    const validRides = rides.filter(ride => {
            const { userFirstName, userLastName, userEmail, userUsername, status } = ride;
        
            
            if (!userFirstName || !userLastName  || !userEmail || !userUsername) {
                return false; 
            }
        
            
            const matchesStatus = filterVariable && status !== filterVariable ? false : true;

           
            const matchesQuery = [userFirstName, userLastName, userEmail, userUsername]
                .some(field => field.toLowerCase().includes(query.toLowerCase()));
            return matchesStatus  && matchesQuery;
        });
        

        res.json({
            status: "success",
            message: "Rides found successfully",
            data: {
                rides: validRides.slice(0, pageSize)
            }
        })
        

    }catch(error){
        console.error(`Unable to search for rides by admin: ${error}`);
        return next(createError(500, server_error))
        }
}