// import { Kafka } from "kafkajs";
// import { PrismaClient } from "@prisma/client";
// import { parse } from "./parser";
// import { JsonObject } from "@prisma/client/runtime/library";
// import { sendEmail } from "./sendEmail";
// import { sendStripePayment } from "./sendStripePayment"


// const prismaClient = new PrismaClient();

// const TOPIC_NAME = "zap-events";

// // const kafka = new Kafka({
// //   clientId: "outbox-processor",
// //   brokers: ["localhost:9092"],
// // });

// // const kafka = new Kafka({
// //   clientId: "outbox-processor",
// //   brokers: [process.env.KAFKA_BROKER!],  // from Confluent UI
// //   ssl: true,
// //   sasl: {
// //     mechanism: "plain",                  // must be lowercase
// //     username: process.env.KAFKA_API_KEY!, // from Confluent API Key
// //     password: process.env.KAFKA_API_SECRET!,
// //   },
// // });

// const kafka = new Kafka({
//   clientId: "outbox-processor",
//   brokers: [process.env.KAFKA_BROKER!],
//   ssl: true,
//   sasl: {
//     mechanism: "plain",         // ✅ must be lowercase
//     username: process.env.KAFKA_API_KEY!,
//     password: process.env.KAFKA_API_SECRET!,
//   },
// });




// async function main() {
//   const consumer = kafka.consumer({ groupId: "main-worker" });
//   await consumer.connect();

//   const producer = kafka.producer();
//   await producer.connect();

//   await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

//   await consumer.run({
//     autoCommit: false,
//     eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
//       console.log({
//         offset: message.offset,
//         value: message.value?.toString(),
//       });

//       if (!message.value?.toString()) {
//         return;
//       }

//       const parsedValue = JSON.parse(message.value?.toString());
//       const zapRunId = parsedValue.zapRunId;
//       const stage = parsedValue.stage;

//       const zapRunDetails = await prismaClient.zapRun.findFirst({
//         where: {
//           id: zapRunId
//         },

//         include: {
//           zap: {
//             include: {
//               actions: {
//                 include: {
//                   type: true
//                 }
//               }
//             }
//           }
//         }
//       })




//       const currentAction = zapRunDetails?.zap.actions.find(x => x.sortingOrder === stage);

//       console.log(currentAction)

//       if (!currentAction) {
//         console.log("Current action not found?");
//         return;
//       }

//       const zapRunMetadata = zapRunDetails?.metadata;

//       console.log("ZapRun Metadata:", JSON.stringify(zapRunMetadata, null, 2));


//       if (currentAction.type.id === "email") {
//         const body = parse((currentAction.metadata as JsonObject)?.body as string, zapRunMetadata);
//         const to = parse((currentAction.metadata as JsonObject)?.email as string, zapRunMetadata);
//         console.log(`Sending out email to ${to} body is ${body}`)
//         await sendEmail(to, body);

//       }

//       console.log("logging currentAction : " ,currentAction);

       

      



//       if (currentAction.type.id === "send-money") {
//         console.log("Sending out Solana (Stripe payment)");

//         console.log("ZapRun Metadata:", JSON.stringify(zapRunMetadata, null, 2));
//         console.log("Current Action Metadata:", JSON.stringify(currentAction.metadata, null, 2));

      
//         // Extract and parse the amount and email from metadata
//         const amount = parse((currentAction.metadata as JsonObject)?.amount as string, zapRunMetadata);
//         const to = parse((currentAction.metadata as JsonObject)?.address as string, zapRunMetadata);
      
//         console.log(to);
//         console.log(amount);

//         if (!amount || !to) {
//           console.error("❌ Invalid amount or email metadata.");
//           return;
//         }
      
//         console.log(`Processing payment of ₹${amount} for ${to}`);
      
//         try {
//           // Send Stripe payment request
//           const paymentResult = await sendStripePayment(to, amount);
      
//           if (paymentResult.success) {
//             console.log(`✅ Payment Intent Created: ${paymentResult.sessionId}`);
//             console.log(`Redirect URL: ${paymentResult.url}`);
            
//             // Send webhook or handle further processing if needed
//             console.log("Waiting for webhook confirmation...");
            
            

//           } else {
//             console.error(`❌ Payment creation failed: ${paymentResult.message}`);
//           }
      
//         } catch (error) {
//           console.error("❌ Payment processing failed:", error);
//         }
//       }
      

//       await new Promise((r) => setTimeout(r, 500));
//       const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1;

//       if (lastStage !== stage) {
//         producer.send({
//           topic: TOPIC_NAME,
//           messages: [{
//             value: JSON.stringify({
//               stage: stage + 1,
//               zapRunId
//             })
//           }]
//         });
//       }

//       console.log("processing done")



//       await consumer.commitOffsets([
//         {
//           topic: TOPIC_NAME,
//           partition: partition,
//           offset: (parseInt(message.offset) + 1).toString(),
//         },
//       ]);
//     },
//   });
// }

// main();




import { Kafka } from "kafkajs";
import { PrismaClient } from "@prisma/client";
import { parse } from "./parser";
import { JsonObject } from "@prisma/client/runtime/library";
import { sendEmail } from "./sendEmail";
import { sendStripePayment } from "./sendStripePayment";

const prismaClient = new PrismaClient();
const TOPIC_NAME = "zap-events";

// Validate environment variables
if (!process.env.KAFKA_BROKER) {
  throw new Error("KAFKA_BROKER environment variable is required");
}
if (!process.env.KAFKA_API_KEY) {
  throw new Error("KAFKA_API_KEY environment variable is required");
}
if (!process.env.KAFKA_API_SECRET) {
  throw new Error("KAFKA_API_SECRET environment variable is required");
}

const kafka = new Kafka({
  clientId: "main-worker",
  brokers: [process.env.KAFKA_BROKER],
  ssl: {
    rejectUnauthorized: true,
  },
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_API_KEY,
    password: process.env.KAFKA_API_SECRET,
  },
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

let isShuttingDown = false;

async function processMessage(zapRunId: string, stage: number, producer: any) {
  try {
    console.log(`🔄 Processing message - ZapRun: ${zapRunId}, Stage: ${stage}`);

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
    });

    if (!zapRunDetails) {
      console.error(`❌ ZapRun not found: ${zapRunId}`);
      return;
    }

    const currentAction = zapRunDetails.zap.actions.find(x => x.sortingOrder === stage);

    if (!currentAction) {
      console.error(`❌ Current action not found for stage: ${stage}`);
      return;
    }

    const zapRunMetadata = zapRunDetails.metadata;
    console.log("📊 ZapRun Metadata:", JSON.stringify(zapRunMetadata, null, 2));
    console.log("⚡ Current Action:", JSON.stringify(currentAction, null, 2));

    // Process Email Action
    if (currentAction.type.id === "email") {
      try {
        const body = parse((currentAction.metadata as JsonObject)?.body as string, zapRunMetadata);
        const to = parse((currentAction.metadata as JsonObject)?.email as string, zapRunMetadata);
        
        if (!body || !to) {
          console.error("❌ Invalid email metadata - missing body or recipient");
          return;
        }

        console.log(`📧 Sending email to ${to}`);
        await sendEmail(to, body);
        console.log("✅ Email sent successfully");

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("❌ Email sending failed:", errorMessage);
        throw error;
      }
    }

    // Process Payment Action
    if (currentAction.type.id === "send-money") {
      try {
        console.log("💰 Processing Stripe payment");

        const amount = parse((currentAction.metadata as JsonObject)?.amount as string, zapRunMetadata);
        const to = parse((currentAction.metadata as JsonObject)?.address as string, zapRunMetadata);

        console.log(`💳 Payment details: ₹${amount} to ${to}`);

        if (!amount || !to) {
          console.error("❌ Invalid payment metadata - missing amount or address");
          return;
        }

        const paymentResult = await sendStripePayment(to, amount);

        if (paymentResult.success) {
          console.log(`✅ Payment Intent Created: ${paymentResult.sessionId}`);
          console.log(`🔗 Redirect URL: ${paymentResult.url}`);
        } else {
          console.error(`❌ Payment creation failed: ${paymentResult.message}`);
          throw new Error(`Payment failed: ${paymentResult.message}`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("❌ Payment processing failed:", errorMessage);
        throw error;
      }
    }

    // Wait a bit before proceeding
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if there are more stages to process
    const lastStage = (zapRunDetails.zap.actions?.length || 1) - 1;

    if (lastStage !== stage) {
      console.log(`➡️ Moving to next stage: ${stage + 1}`);
      
      await producer.send({
        topic: TOPIC_NAME,
        messages: [{
          key: zapRunId, // Use zapRunId as partition key
          value: JSON.stringify({
            stage: stage + 1,
            zapRunId,
            timestamp: new Date().toISOString()
          })
        }]
      });
    } else {
      console.log("🏁 Workflow completed - no more stages");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error processing message for ZapRun ${zapRunId}:`, errorMessage);
    throw error;
  }
}

async function main() {
  const consumer = kafka.consumer({ 
    groupId: "main-worker",
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });
  
  const producer = kafka.producer({
    maxInFlightRequests: 1,
    idempotent: false,
    transactionTimeout: 30000,
  });

  try {
    console.log("🔌 Connecting to Kafka...");
    await consumer.connect();
    await producer.connect();
    console.log("✅ Connected to Kafka");

    await consumer.subscribe({ 
      topic: TOPIC_NAME, 
      fromBeginning: true 
    });

    console.log(`🎯 Subscribed to topic: ${TOPIC_NAME}`);

    await consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        try {
          console.log(`📨 Received message - Offset: ${message.offset}`);

          if (!message.value?.toString()) {
            console.warn("⚠️ Empty message received, skipping");
            return;
          }

          const parsedValue = JSON.parse(message.value.toString());
          const zapRunId = parsedValue.zapRunId;
          const stage = parsedValue.stage;

          if (!zapRunId || stage === undefined) {
            console.error("❌ Invalid message format - missing zapRunId or stage");
            return;
          }

          // Process the message
          await processMessage(zapRunId, stage, producer);

          // Send heartbeat to keep session alive
          await heartbeat();

          // Commit the offset after successful processing
          await consumer.commitOffsets([
            {
              topic: TOPIC_NAME,
              partition: partition,
              offset: (parseInt(message.offset) + 1).toString(),
            },
          ]);

          console.log("✅ Message processed and committed");

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error("❌ Error processing message:", errorMessage);
          
          // Pause the consumer temporarily on error
          console.log("⏸️ Pausing consumer for 5 seconds due to error");
          pause();
          setTimeout(() => consumer.resume([{ topic: TOPIC_NAME }]), 5000);
        }
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("💥 Fatal error in main:", errorMessage);
    throw error;
  }
}

// Graceful shutdown handling
function setupGracefulShutdown() {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`\n📡 Received ${signal}, initiating graceful shutdown...`);
      isShuttingDown = true;
      
      try {
        await cleanup();
        process.exit(0);
      } catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    });
  });

  process.on('uncaughtException', async (error) => {
    console.error('💥 Uncaught exception:', error);
    await cleanup();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
    await cleanup();
    process.exit(1);
  });
}

async function cleanup() {
  console.log("🧹 Cleaning up resources...");
  try {
    // Note: You'll need to make consumer and producer accessible here
    // or implement a proper cleanup mechanism
    await prismaClient.$disconnect();
    console.log("✅ Cleanup completed");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Error during cleanup:", errorMessage);
  }
}

// Start the application
setupGracefulShutdown();
main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error("💥 Application crashed:", errorMessage);
  process.exit(1);
});