"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const auth_1 = __importDefault(require("./routes/auth"));
const ride_1 = __importDefault(require("./routes/ride"));
const user_1 = __importDefault(require("./routes/user"));
const error_controllers_1 = require("./controllers/error-controllers");
const access_tokens_1 = require("./middlewares/access-tokens");
const auth_controllers_1 = require("./controllers/auth-controllers");
const upload_1 = __importDefault(require("./middlewares/upload"));
const notification_1 = __importDefault(require("./routes/notification"));
const conversation_1 = __importDefault(require("./routes/conversation"));
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
app.use("/api/auth", access_tokens_1.isAuthenticated, auth_1.default);
app.use("/api/rides", access_tokens_1.verifyAccessToken, ride_1.default);
app.use("/api/user", access_tokens_1.verifyAccessToken, user_1.default);
app.use("/api/notifications", access_tokens_1.verifyAccessToken, notification_1.default);
app.use("/api/conversations", access_tokens_1.verifyAccessToken, conversation_1.default);
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Soole backend" });
});
app.post("/api/upload-images", upload_1.default.single('image'), auth_controllers_1.uploadImage);
app.all("*", error_controllers_1.notFound);
app.use(error_controllers_1.foundError);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
