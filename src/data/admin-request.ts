import { AdminRequestModel, AdminRequest } from "../nobox/record-structures/admin-request";
import { unknown_error } from "../lib/variables";
type FullAdmin = AdminRequest & {
    id: string;
    createdAt: string;
    updatedAt: string;
};
export const createAdminRequest = async (data: AdminRequest): Promise<FullAdmin> => {
    try {
        const admin = await AdminRequestModel.insertOne(data);

        if (!admin) {
            throw new Error(unknown_error);
        }
        return admin;
    } catch (error) {
        throw error
    }
}


export const findAdminRequestById = async(id: string): Promise<FullAdmin> => {
    try{
const request = await AdminRequestModel.findOne({id});
return request
    }catch(error){
        throw error
    }
}

export const deleteAdminRequestById = async(id: string) => {
    try{
await AdminRequestModel.deleteOneById(id);
    }catch(error) {
        throw error
    }
}