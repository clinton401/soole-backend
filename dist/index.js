"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const api_1 = __importDefault(require("./api"));
const error_controllers_1 = require("./controllers/error-controllers");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.set("trust proxy", 1);
// createHardcodedUser();
// app.use(express.static(path.join(__dirname, '../frontend')));
app.use("/api", api_1.default);
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Soole backend" });
});
app.all("*", error_controllers_1.notFound);
app.use(error_controllers_1.foundError);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
