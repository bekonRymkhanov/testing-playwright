#!/usr/bin/env bash
# Starts the Toolshop app from docker-compose.ci.yml and waits until UI and API answer.
set -euo pipefail
compose="docker compose -f docker-compose.ci.yml"

$compose up -d

echo "Waiting for the database..."
timeout 120 bash -c "until $compose exec -T mariadb mysqladmin ping -uroot -proot --silent; do sleep 2; done"

echo "Seeding the database..."
$compose exec -T laravel-api php artisan migrate:refresh --seed --force

echo "Waiting for the API and the UI..."
timeout 60 bash -c 'until curl -sf http://localhost:8091/status > /dev/null; do sleep 2; done'
timeout 300 bash -c 'until curl -sf http://localhost:4200 > /dev/null; do sleep 5; done'
echo "Toolshop is up."
