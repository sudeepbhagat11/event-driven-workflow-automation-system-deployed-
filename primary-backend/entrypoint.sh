#!/bin/sh
echo "Running Prisma migrations..."
npx prisma migrate dev

echo "Seeding database..."
npx prisma db seed

echo "Starting backend..."
exec npm run dev
