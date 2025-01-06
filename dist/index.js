"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const node_path_1 = __importDefault(require("node:path"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use(express_1.default.static(node_path_1.default.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
    res.sendFile(node_path_1.default.join(__dirname, '../frontend/index.html'));
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
