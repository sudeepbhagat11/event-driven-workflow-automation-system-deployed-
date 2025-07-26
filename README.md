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

🔔 Trigger: Webhook (e.g. Stripe, custom POST)
A user configures a workflow (Zap) with the following steps:

🧭 Workflow Steps
Trigger: A webhook is received at

ruby
Copy
Edit
POST /hooks/catch/:userId/:zapId
This could come from Stripe, GitHub, a cron job, or any external source.

Action 1: Send an email using a template.
For example:

json
Copy
Edit
{
  "to": "{{user.email}}",
  "body": "Hello {{user.name}}, your order has been received!"
}
Action 2: Generate a Stripe test-mode payment link dynamically using metadata (e.g. amount, user email) and send it to the customer.

🛠️ How It Works Internally
When the webhook hits /hooks/catch/:userId/:zapId, the backend stores:

A new row in the ZapRun table, storing the webhook payload (as JSON).

A corresponding row in ZapRunOutbox to queue this for processing.

A Kafka producer service scans the outbox table, publishes a message like:

json
Copy
Edit
{
  "zapRunId": "abc123",
  "stage": 0
}
...to the zap-events topic.

A Kafka worker/consumer listens to zap-events and processes each stage:


---

## 📒 Tech Stack

* **Frontend**: React + Tailwind CSS
* **Backend**: Node.js + Express + Prisma ORM
* **Database**: PostgreSQL (via Docker)
* **Messaging**: Apache Kafka
* **Email**: Gmail SMTP (Nodemailer)
* **Payments**: Stripe (Test mode)

---


