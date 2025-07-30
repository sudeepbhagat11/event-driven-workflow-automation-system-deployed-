# #!/bin/sh

# echo "Waiting for Kafka to be ready..."
# sleep 10

# echo "Creating Kafka topic zap-events..."
# /opt/kafka/bin/kafka-topics.sh --create --if-not-exists --topic zap-events --bootstrap-server kafka:9092

# echo "Kafka topic zap-events created successfully!"



#!/bin/sh

# Run the wait-for-kafka script
sh /wait-for-kafka.sh

echo "Creating Kafka topic zap-events..."
kafka-topics.sh --create --topic zap-events --bootstrap-server kafka:9092 --if-not-exists

echo "Kafka topic zap-events is ready!"


