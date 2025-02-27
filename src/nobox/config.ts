import { Config, getFunctions, getSchemaCreator } from "nobox-client";
import {NOBOX_TOKEN, NOBOX_PROJECT, NOBOX_ENDPOINT} from "../config/variables"


export const config: Config = {
  endpoint: NOBOX_ENDPOINT,
  project: NOBOX_PROJECT,
  token: NOBOX_TOKEN
};


export const createRowSchema = getSchemaCreator(config, { type: "rowed" });

export const createKeyGroupSchema = getSchemaCreator(config, {
  type: "key-group",
});

export const Nobox = getFunctions(config);
