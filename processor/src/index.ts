// import { PrismaClient } from "@prisma/client";
// import { Kafka } from "kafkajs";

// const client = new PrismaClient();
// const TOPIC_NAME = "zap-events";

// const kafka = new Kafka({
//   clientId: "outbox-processor",
//   brokers: ["localhost:9092"], 
// });

// async function main() {
//   const producer = kafka.producer();
//   await producer.connect();

//   while (1) {
//     const pendingRows = await client.zapRunOutbox.findMany({
//       where: {},
//       take: 10,
//     });

//     producer.send({
//       topic: TOPIC_NAME,
//       messages: pendingRows.map((r) => {
//         return {
//           value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 }),
//         };
//       }),
//     });

//     await client.zapRunOutbox.deleteMany({
//       where: {
//         id: {
//           in: pendingRows.map((x) => x.id),
//         },
//       },
//     });

//     await new Promise((r) => setTimeout(r, 3000));
//   }
// }

// main();





import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const client = new PrismaClient();
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
  clientId: "outbox-processor",
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

const producer = kafka.producer({
  maxInFlightRequests: 1,
  idempotent: false,
  transactionTimeout: 30000,
});

let isShuttingDown = false;

async function connectProducer() {
  try {
    await producer.connect();
    console.log("✅ Kafka producer connected");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Failed to connect Kafka producer:", errorMessage);
    throw error;
  }
}

async function processOutboxBatch() {
  try {
    // Fetch pending rows with proper error handling
    const pendingRows = await client.zapRunOutbox.findMany({
      where: {},
      take: 10,
      orderBy: {
        id: 'asc' // Process in order
      }
    });

    if (pendingRows.length === 0) {
      return 0;
    }

    console.log(`📦 Processing ${pendingRows.length} outbox entries`);

    // Prepare messages with better structure
    const messages = pendingRows.map((row) => ({
      key: row.zapRunId, // Use zapRunId as partition key for ordered processing
      value: JSON.stringify({ 
        zapRunId: row.zapRunId, 
        stage: 0,
        timestamp: new Date().toISOString(),
        outboxId: row.id
      }),
      timestamp: Date.now().toString()
    }));

    // Send to Kafka
    await producer.send({
      topic: TOPIC_NAME,
      messages: messages,
    });

    // Delete processed rows
    await client.zapRunOutbox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((row) => row.id),
        },
      },
    });

    console.log(`✅ Sent and deleted ${pendingRows.length} rows`);
    return pendingRows.length;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Error processing outbox batch:", errorMessage);
    
    // For database errors, we might want to continue
    if (error instanceof Error && (error.message.includes('P2002') || error.message.includes('P2025'))) {
      console.log("🔄 Database constraint error, continuing...");
      return 0;
    }
    
    // For Kafka errors, we should retry
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting outbox processor...");
  
  try {
    await connectProducer();
    
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;
    
    while (!isShuttingDown) {
      try {
        const processedCount = await processOutboxBatch();
        
        // Reset error counter on successful processing
        if (processedCount > 0) {
          consecutiveErrors = 0;
        }
        
        // Dynamic polling interval based on activity
        const sleepTime = processedCount > 0 ? 1000 : 3000; // 1s if busy, 3s if idle
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
        
      } catch (error) {
        consecutiveErrors++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Batch processing error (${consecutiveErrors}/${maxConsecutiveErrors}):`, errorMessage);
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error("💥 Too many consecutive errors, shutting down");
          break;
        }
        
        // Exponential backoff on errors
        const backoffTime = Math.min(1000 * Math.pow(2, consecutiveErrors), 30000);
        console.log(`⏳ Backing off for ${backoffTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      }
    }
    
  } catch (error) {
    console.error("💥 Fatal error in main loop:", error);
  } finally {
    await cleanup();
  }
}

async function cleanup() {
  console.log("🧹 Cleaning up...");
  try {
    await producer.disconnect();
    await client.$disconnect();
    console.log("✅ Cleanup completed");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Error during cleanup:", errorMessage);
  }
}

// Graceful shutdown handling
function setupGracefulShutdown() {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`\n📡 Received ${signal}, initiating graceful shutdown...`);
      isShuttingDown = true;
      
      // Give some time for current batch to complete
      setTimeout(() => {
        console.log("⏰ Force exiting after timeout");
        process.exit(1);
      }, 10000);
    });
  });
  
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error);
    isShuttingDown = true;
    cleanup().finally(() => process.exit(1));
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
    isShuttingDown = true;
    cleanup().finally(() => process.exit(1));
  });
}

// Start the application
setupGracefulShutdown();
main().catch((error) => {
  console.error("💥 Application crashed:", error);
  process.exit(1);
});