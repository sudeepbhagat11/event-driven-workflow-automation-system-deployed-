#!/bin/bash

echo "Waiting for Kafka to be ready..."
sleep 10

echo "Creating Kafka topic: zap-events"
/usr/bin/kafka-topics --create --topic zap-events --bootstrap-server kafka:9092 --replication-factor 1 --partitions 1

echo "Kafka topic zap-events created successfully."
