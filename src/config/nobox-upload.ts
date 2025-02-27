import axios from "axios";

import {NOBOX_TOKEN, NOBOX_PROJECT, NOBOX_ENDPOINT, NOBOX_UPLOAD_URL} from "./variables"
export interface CloudFile {
    _id: string;
    name: string;
    originalName: string;
    ownedBy: string;
    s3Link: string;
    updatedAt: string;
    createdAt: string;
}


export const noboxUpload = async(file:  File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
        if (!file) {
            throw new Error("No File to upload");
        }

        const response = await axios.post(`${NOBOX_UPLOAD_URL}/${NOBOX_PROJECT}/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${NOBOX_TOKEN}`,
            },
           
        });

        const data: CloudFile = response.data;
  
        if(!data){
            throw new Error("File upload error")
        }

        return data;
    } catch (error) {
        console.error(`Unable to upload file: ${error}`);
        throw error
    }
}