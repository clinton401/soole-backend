import  {  Config,  getFunctions,  getSchemaCreator  }  from  "nobox-client";
import dotenv from "dotenv";
dotenv.config();
const token = process.env.NOBOX_TOKEN;
const endpoint = process.env.NOBOX_ENDPOINT;
if(!token || !endpoint) {
    throw new Error("Nobox Accesstoken and Endpoint are required");
}
export const config: Config = {
endpoint, 
project:  "soole",
token, 
};

export const createRowSchema = getSchemaCreator(config, { type: "rowed" });

export const createKeyGroupSchema = getSchemaCreator(config, { type: "key-group" });

export  const  Nobox  =  getFunctions(config);