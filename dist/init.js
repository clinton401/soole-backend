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
const user_1 = require("./nobox/record-structures/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createHardcodedUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const plainPassword = "1234567";
        const hashedPassword = yield bcrypt_1.default.hash(plainPassword, 10);
        const hardcodedUser = {
            phone: "+2347032778210",
            firstName: "John",
            lastName: "Doe",
            isNumberVerified: true,
            gender: "MALE",
            dob: "1990-01-01",
            username: "johndoe",
            email: "johndoe@example.com",
            password: hashedPassword,
        };
        const existingUser = yield user_1.UserModel.findOne({
            phone: hardcodedUser.phone,
        });
        if (existingUser) {
            console.log("User already exists.");
            return;
        }
        const user = yield user_1.UserModel.insertOne(hardcodedUser);
        if (user) {
            console.log("Hardcoded user added successfully!");
        }
        else {
            console.log("Failed to add hardcoded user.");
        }
    }
    catch (error) {
        console.error("Error adding hardcoded user:", error);
    }
});
exports.default = createHardcodedUser;
