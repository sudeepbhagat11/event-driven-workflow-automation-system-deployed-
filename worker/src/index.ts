import { Kafka } from "kafkajs";
import { PrismaClient } from "@prisma/client";
import { parse } from "./parser";
import { JsonObject } from "@prisma/client/runtime/library";
import { sendEmail } from "./sendEmail";
import { sendStripePayment } from "./sendStripePayment"


const prismaClient = new PrismaClient();

const TOPIC_NAME = "zap-events";

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  const consumer = kafka.consumer({ groupId: "main-worker" });
  await consumer.connect();

  const producer = kafka.producer();
  await producer.connect();

  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      console.log({
        offset: message.offset,
        value: message.value?.toString(),
      });

      if (!message.value?.toString()) {
        return;
      }

      const parsedValue = JSON.parse(message.value?.toString());
      const zapRunId = parsedValue.zapRunId;
      const stage = parsedValue.stage;

      const zapRunDetails = await prismaClient.zapRun.findFirst({
        where: {
          id: zapRunId
        },

        include: {
          zap: {
            include: {
              actions: {
                include: {
                  type: true
                }
              }
            }
          }
        }
      })




      const currentAction = zapRunDetails?.zap.actions.find(x => x.sortingOrder === stage);

      console.log(currentAction)

      if (!currentAction) {
        console.log("Current action not found?");
        return;
      }

      const zapRunMetadata = zapRunDetails?.metadata;

      console.log("ZapRun Metadata:", JSON.stringify(zapRunMetadata, null, 2));


      if (currentAction.type.id === "email") {
        const body = parse((currentAction.metadata as JsonObject)?.body as string, zapRunMetadata);
        const to = parse((currentAction.metadata as JsonObject)?.email as string, zapRunMetadata);
        console.log(`Sending out email to ${to} body is ${body}`)
        await sendEmail(to, body);

      }

      console.log("logging currentAction : " ,currentAction);

       

      



      if (currentAction.type.id === "send-money") {
        console.log("Sending out Solana (Stripe payment)");

        console.log("ZapRun Metadata:", JSON.stringify(zapRunMetadata, null, 2));
        console.log("Current Action Metadata:", JSON.stringify(currentAction.metadata, null, 2));

      
        // Extract and parse the amount and email from metadata
        const amount = parse((currentAction.metadata as JsonObject)?.amount as string, zapRunMetadata);
        const to = parse((currentAction.metadata as JsonObject)?.address as string, zapRunMetadata);
      
        console.log(to);
        console.log(amount);

        if (!amount || !to) {
          console.error("❌ Invalid amount or email metadata.");
          return;
        }
      
        console.log(`Processing payment of ₹${amount} for ${to}`);
      
        try {
          // Send Stripe payment request
          const paymentResult = await sendStripePayment(to, amount);
      
          if (paymentResult.success) {
            console.log(`✅ Payment Intent Created: ${paymentResult.sessionId}`);
            console.log(`Redirect URL: ${paymentResult.url}`);
            
            // Send webhook or handle further processing if needed
            console.log("Waiting for webhook confirmation...");
            
            

          } else {
            console.error(`❌ Payment creation failed: ${paymentResult.message}`);
          }
      
        } catch (error) {
          console.error("❌ Payment processing failed:", error);
        }
      }
      

      await new Promise((r) => setTimeout(r, 500));
      const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1;

      if (lastStage !== stage) {
        producer.send({
          topic: TOPIC_NAME,
          messages: [{
            value: JSON.stringify({
              stage: stage + 1,
              zapRunId
            })
          }]
        });
      }

      console.log("processing done")



      await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition: partition,
          offset: (parseInt(message.offset) + 1).toString(),
        },
      ]);
    },
  });
}

main();


