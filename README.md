# 🔧 Workflow Automation Platform

This is a prototype of a ** automation tool** that allows users to create workflows involving **Stripe payments** and **Gmail email sending**. Events are processed in a Kafka-powered system with PostgreSQL as the backend and a microservices-based architecture.

---

## 📦 Features

* **Trigger-based automation**
* **Send email** via Gmail SMTP
* **Send money** via Stripe (Test Mode)
* **Event-driven architecture using Kafka**
* **Modular microservices** (Processor, Worker, Hooks)
* **PostgreSQL + Prisma** for DB layer

---

## 🧱 Project Structure

```
root/
├── primary-backend/   # Handles DB, API, auth
├── frontend/          # Web UI
├── processor/         # Kafka topic producer
├── worker/            # Kafka consumer that runs tasks
├── hooks/             # Action logic (like sending emails/payments)
```

---

## ✨ Quick Start

### 📌 Prerequisites

* Docker
* Node.js (v18+)
* NPM
* Kafka (via Docker)
* Prisma CLI (`npm install -g prisma`)

---

### ✅ Setup Instructions

```bash
# === Step 1: Setup PostgreSQL ===
cd primary-backend
sudo docker run -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword postgres

# === Step 2: Setup Prisma and Seed DB ===
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# === Step 3: Start Backend Server ===
npm run dev
```

```bash
# === Step 4: Start Frontend UI ===
cd ../frontend
npm run dev
```

```bash
# === Step 5: Setup Kafka (using Docker) ===
cd ../processor

# 1. Start Kafka container
sudo docker run -p 9092:9092 --name kafka apache/kafka:3.9.0

# 2. Enter Kafka container
sudo docker exec -it kafka /bin/bash

# 3. Navigate to Kafka binaries
cd /opt/kafka/bin/

# 4. Create a topic named 'zap-events'
./kafka-topics.sh --create --topic zap-events --bootstrap-server localhost:9092

# 5. Exit container
exit

# 6. Start Processor Service
npm run dev
```

```bash
# === Step 6: Start Worker Service ===
cd ../worker
npm run dev
```

```bash
# === Step 7: Start Hooks Service (Gmail/Stripe logic) ===
cd ../hooks
npm run dev
```

---

## 📸 Sample Workflow

* **Trigger**: Time-based trigger or webhook
* **Action 1**: Send email to user via Gmail
* **Action 2**: Generate a Stripe test-mode payment link and send it

All triggered events are sent to a **Kafka topic** (`zap-events`), picked up by the `worker`, and executed through handlers in `hooks`.

---

## 📒 Tech Stack

* **Frontend**: React + Tailwind CSS
* **Backend**: Node.js + Express + Prisma ORM
* **Database**: PostgreSQL (via Docker)
* **Messaging**: Apache Kafka
* **Email**: Gmail SMTP (Nodemailer)
* **Payments**: Stripe (Test mode)

---


