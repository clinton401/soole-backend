"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noboxUpload = void 0;
const axios_1 = __importDefault(require("axios"));
const variables_1 = require("./variables");
const noboxUpload = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const formData = new FormData();
    formData.append("file", file);
    try {
        if (!file) {
            throw new Error("No File to upload");
        }
        const response = yield axios_1.default.post(`${variables_1.NOBOX_UPLOAD_URL}/${variables_1.NOBOX_PROJECT}/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${variables_1.NOBOX_TOKEN}`,
            },
        });
        const data = response.data;
        if (!data) {
            throw new Error("File upload error");
        }
        return data;
    }
    catch (error) {
        console.error(`Unable to upload file: ${error}`);
        throw error;
    }
});
exports.noboxUpload = noboxUpload;
