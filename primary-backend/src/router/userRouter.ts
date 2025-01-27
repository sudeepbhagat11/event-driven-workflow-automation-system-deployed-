import { Router } from "express";
import { authMiddleware } from "./middleware";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "../db/index";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";

const router = Router();

// @ts-ignore
router.post("/signup", async (req, res) => {
  const body = req.body;

  const parseData = SignupSchema.safeParse(body);

  if (!parseData.success) {
    return res.status(411).json({
      message: " Incorrect Inputs",
    });
  }

  const userExists = await prismaClient.user.findFirst({
    where: {
      email: parseData.data.username,
    },
  });

  if (userExists) {
    return res.status(403).json({
      message: "User Already Exits",
    });
  }

  await prismaClient.user.create({
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
});

// @ts-ignore
router.post("/signin", async (req, res) => {
  const body = req.body;

  const parseData = SigninSchema.safeParse(body);

  if (!parseData.success) {
    return res.status(411).json({
      message: " Incorrect Inputs",
    });
  }

  const user = await prismaClient.user.findFirst({
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

  const token = jwt.sign(
    {
      // @ts-ignore
      id: user.id,
    },
    JWT_PASSWORD
  );

  res.json({
    token: token,
  });
});

// @ts-ignore
router.get("/", authMiddleware, async (req, res) => {
  // @ts-ignore
  const id = req.id;
  const user = await prismaClient.user.findFirst({
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
});

export const userRouter = router;
