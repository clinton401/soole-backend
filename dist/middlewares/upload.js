"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
// const storage = multer.diskStorage({
//     filename: function (req, file, cb) {
//       const uniqueName = `${Date.now()}-${file.originalname}`;
//       cb(null, uniqueName);
//     },
//   });
//   const upload = multer({ storage: storage });
const upload = (0, multer_1.default)({ dest: 'uploads/' });
exports.default = upload;
