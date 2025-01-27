import express from "express";
import { userRouter } from "./router/userRouter";
import { zapRouter } from "./router/zapRouter";
import cors from "cors";
import { triggerRouter } from "./router/triggerRouter";
import { actionRouter } from "./router/actionRouter";

const app = express();

app.use(express.json());
app.use(cors());

const corsOptions = {
  origin: ["http://localhost:3001"], // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use("/api/v1/user", userRouter);

app.use("/api/v1/zap", zapRouter);

app.use("/api/v1/trigger", triggerRouter);

app.use("/api/v1/action", actionRouter);

app.listen(3000, () => {
  console.log("Listening at 3000");
});
