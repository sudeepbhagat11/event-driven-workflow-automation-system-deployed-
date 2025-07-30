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
exports.userRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("./middleware");
const types_1 = require("../types");
const index_1 = require("../db/index");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
// @ts-ignore
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parseData = types_1.SignupSchema.safeParse(body);
    if (!parseData.success) {
        return res.status(411).json({
            message: " Incorrect Inputs",
        });
    }
    const userExists = yield index_1.prismaClient.user.findFirst({
        where: {
            email: parseData.data.username,
        },
    });
    if (userExists) {
        return res.status(403).json({
            message: "User Already Exits",
        });
    }
    yield index_1.prismaClient.user.create({
        data: {
            email: parseData.data.username,
            password: parseData.data.password,
            name: parseData.data.name,
        },
    });
    // await sendEmail
    return res.json({
        message: "Please verify your email",
    });
}));
// @ts-ignore
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parseData = types_1.SigninSchema.safeParse(body);
    if (!parseData.success) {
        return res.status(411).json({
            message: " Incorrect Inputs",
        });
    }
    const user = yield index_1.prismaClient.user.findFirst({
        where: {
            email: parseData.data.username,
            password: parseData.data.password,
        },
    });
    if (!user) {
        return res.status(403).json({
            message: "User credentials not correct",
        });
    }
    // sign the jwt token
    const token = jsonwebtoken_1.default.sign({
        // @ts-ignore
        id: user.id,
    }, config_1.JWT_PASSWORD);
    res.json({
        token: token,
    });
}));
// @ts-ignore
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const id = req.id;
    const user = yield index_1.prismaClient.user.findFirst({
        where: {
            id,
        },
        select: {
            name: true,
            email: true,
        },
    });
    return res.json({
        user,
    });
}));
exports.userRouter = router;
