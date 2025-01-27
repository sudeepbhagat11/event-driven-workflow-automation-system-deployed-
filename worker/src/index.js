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
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const client_1 = require("@prisma/client");
const parser_1 = require("./parser");
const sendEmail_1 = require("./sendEmail");
const sendStripePayment_1 = require("./sendStripePayment");
const prismaClient = new client_1.PrismaClient();
const TOPIC_NAME = "zap-events";
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor",
    brokers: ["localhost:9092"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({ groupId: "main-worker" });
        yield consumer.connect();
        const producer = kafka.producer();
        yield producer.connect();
        yield consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });
        yield consumer.run({
            autoCommit: false,
            eachMessage: ({ topic, partition, message, heartbeat, pause }) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                console.log({
                    offset: message.offset,
                    value: (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString(),
                });
                if (!((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString())) {
                    return;
                }
                const parsedValue = JSON.parse((_c = message.value) === null || _c === void 0 ? void 0 : _c.toString());
                const zapRunId = parsedValue.zapRunId;
                const stage = parsedValue.stage;
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
                const currentAction = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.find(x => x.sortingOrder === stage);
                console.log(currentAction);
                if (!currentAction) {
                    console.log("Current action not found?");
                    return;
                }
                const zapRunMetadata = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.metadata;
                console.log("ZapRun Metadata:", JSON.stringify(zapRunMetadata, null, 2));
                if (currentAction.type.id === "email") {
                    const body = (0, parser_1.parse)((_d = currentAction.metadata) === null || _d === void 0 ? void 0 : _d.body, zapRunMetadata);
                    const to = (0, parser_1.parse)((_e = currentAction.metadata) === null || _e === void 0 ? void 0 : _e.email, zapRunMetadata);
                    console.log(`Sending out email to ${to} body is ${body}`);
                    yield (0, sendEmail_1.sendEmail)(to, body);
                }
                console.log("logging currentAction : ", currentAction);
                if (currentAction.type.id === "send-money") {
                    console.log("Sending out Solana (Stripe payment)");
                    console.log("ZapRun Metadata:", JSON.stringify(zapRunMetadata, null, 2));
                    console.log("Current Action Metadata:", JSON.stringify(currentAction.metadata, null, 2));
                    // Extract and parse the amount and email from metadata
                    const amount = (0, parser_1.parse)((_f = currentAction.metadata) === null || _f === void 0 ? void 0 : _f.amount, zapRunMetadata);
                    const to = (0, parser_1.parse)((_g = currentAction.metadata) === null || _g === void 0 ? void 0 : _g.address, zapRunMetadata);
                    console.log(to);
                    console.log(amount);
                    if (!amount || !to) {
                        console.error("❌ Invalid amount or email metadata.");
                        return;
                    }
                    console.log(`Processing payment of ₹${amount} for ${to}`);
                    try {
                        // Send Stripe payment request
                        const paymentResult = yield (0, sendStripePayment_1.sendStripePayment)(to, amount);
                        if (paymentResult.success) {
                            console.log(`✅ Payment Intent Created: ${paymentResult.sessionId}`);
                            console.log(`Redirect URL: ${paymentResult.url}`);
                            // Send webhook or handle further processing if needed
                            console.log("Waiting for webhook confirmation...");
                        }
                        else {
                            console.error(`❌ Payment creation failed: ${paymentResult.message}`);
                        }
                    }
                    catch (error) {
                        console.error("❌ Payment processing failed:", error);
                    }
                }
                yield new Promise((r) => setTimeout(r, 500));
                const lastStage = (((_h = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions) === null || _h === void 0 ? void 0 : _h.length) || 1) - 1;
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
                console.log("processing done");
                yield consumer.commitOffsets([
                    {
                        topic: TOPIC_NAME,
                        partition: partition,
                        offset: (parseInt(message.offset) + 1).toString(),
                    },
                ]);
            }),
        });
    });
}
main();
