
import { AdminModel, Admin } from "../nobox/record-structures/admin";
import { unknown_error } from "../lib/variables";
import { hasAtLeastOneProperty } from "../lib/utils";
type FullAdmin = Admin & {
    id: string;
    createdAt: string;
    updatedAt: string;
};
export const validateUniqueAdminIdentifiers = async (
    personalEmail?: string,
    phone?: string,
    // name?: string
): Promise<string | null> => {
    try {
        if (!personalEmail && !phone ) {
            return "At least one field is required"
        }

        if(personalEmail){
        const isEmailTaken = await AdminModel.findOne({ personalEmail: personalEmail.toLowerCase() });
        if (isEmailTaken) {
            return "Personal email is already in use.";
        }
    }
    if(phone){
        const isPhoneTaken = await AdminModel.findOne({ phone });
        if (isPhoneTaken) {
            return "Phone number is already in use.";
        }
    }
// if(name){
//         const isNameTaken = await AdminModel.findOne({ name: name.toLowerCase() });
//         if (isNameTaken) {
//             return "name is already in use.";
//         }
//     }


        return null;
    } catch (error) {
        console.error(
            `Unable to validate admin identifiers' uniqueness: ${error}`
        );
        return "An unknown error occurred while validating admin identifiers.";
    }
};

export const createAdmin = async (data: Admin): Promise<FullAdmin> => {
    try {
        const admin = await AdminModel.insertOne(data);

        if (!admin) {
            throw new Error(unknown_error);
        }
        return admin;
    } catch (error) {
        throw error
    }
}

export const findAdminById = async (id: string) => {
    try {
        const admin = await AdminModel.findOne({ id }, {});
        return admin;
    } catch (error) {
        throw error
    }
}

export const findAdmin = async (data: Partial<Admin> = {}) => {
    try {

        if (!hasAtLeastOneProperty(data)) {
            throw new Error("User data can not be empty")
        }
        const admin = await AdminModel.findOne(data, {});
        return admin;
    } catch (error) {
        throw error
    }
}
export const checkAdminExists = async (info: string) => {
    try {
        let admin: FullAdmin | null = null;
        admin = await AdminModel.findOne({ phone: info });
        if (!admin) {
            admin = await AdminModel.findOne({ personalEmail: info.toLowerCase() });
        }
        return admin
    } catch (error) {
        throw error
    }
}