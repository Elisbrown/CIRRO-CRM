#!/bin/sh

# Wait for database to be ready (optional but recommended)
# while ! nc -z $DB_HOST $DB_PORT; do
#   echo "Waiting for database..."
#   sleep 1
# done

echo "Running prisma migrate deploy..."
npx prisma migrate deploy

echo "Database migration completed."
