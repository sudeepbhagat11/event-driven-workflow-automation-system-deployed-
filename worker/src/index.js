"use strict";
// import { Kafka } from "kafkajs";
// import { PrismaClient } from "@prisma/client";
// import { parse } from "./parser";
// import { JsonObject } from "@prisma/client/runtime/library";
// import { sendEmail } from "./sendEmail";
// import { sendStripePayment } from "./sendStripePayment"
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const kafkajs_1 = require("kafkajs");
const client_1 = require("@prisma/client");
const parser_1 = require("./parser");
const sendEmail_1 = require("./sendEmail");
const sendStripePayment_1 = require("./sendStripePayment");
const prismaClient = new client_1.PrismaClient();
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
const kafka = new kafkajs_1.Kafka({
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
function processMessage(zapRunId, stage, producer) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            console.log(`🔄 Processing message - ZapRun: ${zapRunId}, Stage: ${stage}`);
            const zapRunDetails = yield prismaClient.zapRun.findFirst({
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
                    const body = (0, parser_1.parse)((_a = currentAction.metadata) === null || _a === void 0 ? void 0 : _a.body, zapRunMetadata);
                    const to = (0, parser_1.parse)((_b = currentAction.metadata) === null || _b === void 0 ? void 0 : _b.email, zapRunMetadata);
                    if (!body || !to) {
                        console.error("❌ Invalid email metadata - missing body or recipient");
                        return;
                    }
                    console.log(`📧 Sending email to ${to}`);
                    yield (0, sendEmail_1.sendEmail)(to, body);
                    console.log("✅ Email sent successfully");
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error("❌ Email sending failed:", errorMessage);
                    throw error;
                }
            }
            // Process Payment Action
            if (currentAction.type.id === "send-money") {
                try {
                    console.log("💰 Processing Stripe payment");
                    const amount = (0, parser_1.parse)((_c = currentAction.metadata) === null || _c === void 0 ? void 0 : _c.amount, zapRunMetadata);
                    const to = (0, parser_1.parse)((_d = currentAction.metadata) === null || _d === void 0 ? void 0 : _d.address, zapRunMetadata);
                    console.log(`💳 Payment details: ₹${amount} to ${to}`);
                    if (!amount || !to) {
                        console.error("❌ Invalid payment metadata - missing amount or address");
                        return;
                    }
                    const paymentResult = yield (0, sendStripePayment_1.sendStripePayment)(to, amount);
                    if (paymentResult.success) {
                        console.log(`✅ Payment Intent Created: ${paymentResult.sessionId}`);
                        console.log(`🔗 Redirect URL: ${paymentResult.url}`);
                    }
                    else {
                        console.error(`❌ Payment creation failed: ${paymentResult.message}`);
                        throw new Error(`Payment failed: ${paymentResult.message}`);
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error("❌ Payment processing failed:", errorMessage);
                    throw error;
                }
            }
            // Wait a bit before proceeding
            yield new Promise((resolve) => setTimeout(resolve, 500));
            // Check if there are more stages to process
            const lastStage = (((_e = zapRunDetails.zap.actions) === null || _e === void 0 ? void 0 : _e.length) || 1) - 1;
            if (lastStage !== stage) {
                console.log(`➡️ Moving to next stage: ${stage + 1}`);
                yield producer.send({
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
            }
            else {
                console.log("🏁 Workflow completed - no more stages");
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ Error processing message for ZapRun ${zapRunId}:`, errorMessage);
            throw error;
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield consumer.connect();
            yield producer.connect();
            console.log("✅ Connected to Kafka");
            yield consumer.subscribe({
                topic: TOPIC_NAME,
                fromBeginning: true
            });
            console.log(`🎯 Subscribed to topic: ${TOPIC_NAME}`);
            yield consumer.run({
                autoCommit: false,
                eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message, heartbeat, pause }) {
                    var _b;
                    try {
                        console.log(`📨 Received message - Offset: ${message.offset}`);
                        if (!((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString())) {
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
                        yield processMessage(zapRunId, stage, producer);
                        // Send heartbeat to keep session alive
                        yield heartbeat();
                        // Commit the offset after successful processing
                        yield consumer.commitOffsets([
                            {
                                topic: TOPIC_NAME,
                                partition: partition,
                                offset: (parseInt(message.offset) + 1).toString(),
                            },
                        ]);
                        console.log("✅ Message processed and committed");
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        console.error("❌ Error processing message:", errorMessage);
                        // Pause the consumer temporarily on error
                        console.log("⏸️ Pausing consumer for 5 seconds due to error");
                        pause();
                        setTimeout(() => consumer.resume([{ topic: TOPIC_NAME }]), 5000);
                    }
                }),
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error("💥 Fatal error in main:", errorMessage);
            throw error;
        }
    });
}
// Graceful shutdown handling
function setupGracefulShutdown() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    signals.forEach((signal) => {
        process.on(signal, () => __awaiter(this, void 0, void 0, function* () {
            console.log(`\n📡 Received ${signal}, initiating graceful shutdown...`);
            isShuttingDown = true;
            try {
                yield cleanup();
                process.exit(0);
            }
            catch (error) {
                console.error("❌ Error during shutdown:", error);
                process.exit(1);
            }
        }));
    });
    process.on('uncaughtException', (error) => __awaiter(this, void 0, void 0, function* () {
        console.error('💥 Uncaught exception:', error);
        yield cleanup();
        process.exit(1);
    }));
    process.on('unhandledRejection', (reason, promise) => __awaiter(this, void 0, void 0, function* () {
        console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
        yield cleanup();
        process.exit(1);
    }));
}
function cleanup() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🧹 Cleaning up resources...");
        try {
            // Note: You'll need to make consumer and producer accessible here
            // or implement a proper cleanup mechanism
            yield prismaClient.$disconnect();
            console.log("✅ Cleanup completed");
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error("❌ Error during cleanup:", errorMessage);
        }
    });
}
// Start the application
setupGracefulShutdown();
main().catch((error) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("💥 Application crashed:", errorMessage);
    process.exit(1);
});
