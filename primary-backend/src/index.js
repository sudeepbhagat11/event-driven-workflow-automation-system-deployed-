"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter_1 = require("./router/userRouter");
const zapRouter_1 = require("./router/zapRouter");
const cors_1 = __importDefault(require("cors"));
const triggerRouter_1 = require("./router/triggerRouter");
const actionRouter_1 = require("./router/actionRouter");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const corsOptions = {
    origin: ["http://localhost:3001"], // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
app.use("/api/v1/user", userRouter_1.userRouter);
app.use("/api/v1/zap", zapRouter_1.zapRouter);
app.use("/api/v1/trigger", triggerRouter_1.triggerRouter);
app.use("/api/v1/action", actionRouter_1.actionRouter);
app.listen(3000, () => {
    console.log("Listening at 3000");
});
