#!/bin/bash

echo "Starting Uni-Market Application..."

# Kill any existing processes
pkill -f "node index.js" || true
sleep 1

# Start server in background
echo "Starting server..."
cd /Volumes/PS2000W/uni-market/server && npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Start client
echo "Starting client..."
cd /Volumes/PS2000W/uni-market/client && npm run dev

# Kill server when client stops
kill $SERVER_PID 2>/dev/null || true
