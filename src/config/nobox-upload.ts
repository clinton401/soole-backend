
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

import { NOBOX_TOKEN, NOBOX_PROJECT, NOBOX_UPLOAD_URL } from "./variables";

export interface CloudFile {
    _id: string;
    name: string;
    originalName: string;
    ownedBy: string;
    s3Link: string;
    updatedAt: string;
    createdAt: string;
}

export const noboxUpload = async (
    filePath: string,
    originalName: string,
    mimetype: string
) => {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), {
        filename: originalName,
        contentType: mimetype,
    });

    try {
        const response = await axios.post(
            `${NOBOX_UPLOAD_URL}/${NOBOX_PROJECT}/upload`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${NOBOX_TOKEN}`,
                },
            }
        );

        const data: CloudFile = response.data;
        if (!data) throw new Error("File upload error");
        return data;
    } catch (error) {
        console.error(`Unable to upload file: ${error}`);
        throw error;
    }
};
