import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "test-producer",
  brokers: [process.env.KAFKA_BROKER],
  ssl: {
    rejectUnauthorized: true,
  },
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_API_KEY,
    password: process.env.KAFKA_API_SECRET,
  },
  connectionTimeout: 10000, // 10 seconds
  requestTimeout: 30000,    // 30 seconds
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

async function run() {
  try {
    console.log("🔄 Connecting to Confluent Cloud...");
    await producer.connect();
    console.log("✅ Connected to Confluent Cloud");

    await producer.send({
      topic: "zap-events",
      messages: [
        { 
          key: "test-key",
          value: JSON.stringify({
            message: "Hello from KafkaJS!",
            timestamp: new Date().toISOString()
          })
        }
      ],
    });

    console.log("✅ Message sent successfully!");
    
  } catch (err) {
    console.error("❌ Error:", err.name);
    console.error("❌ Message:", err.message);
    if (err.cause) {
      console.error("❌ Cause:", err.cause.message);
    }
  } finally {
    try {
      await producer.disconnect();
      console.log("✅ Producer disconnected");
    } catch (disconnectErr) {
      console.error("❌ Error disconnecting:", disconnectErr.message);
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  try {
    await producer.disconnect();
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
});

run();