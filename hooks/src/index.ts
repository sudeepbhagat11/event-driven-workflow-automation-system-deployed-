import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();

const client = new PrismaClient();

app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const userid = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  console.log("Zap id: ",zapId);
  // password check logic

  // store it in db
  await client.$transaction(async (tx) => {
    const run = await tx.zapRun.create({
      data: {
        zapId: zapId,
        metadata: body,
      },
    });

    await tx.zapRunOutbox.create({
      data: {
        zapRunId: run.id,
      },
    });
  });

  res.json({
    message: "Webhooks received",
  });

  // push it on a queue (kafka/redis)
});

app.listen(3002, () => {
  console.log("server started at port 3002");
});
