#!/bin/bash
# Bolt.new startup script

echo "🚀 Starting Rule of Thirds Application..."

# Build the application
echo "📦 Building..."
npm run build

# Start the server
echo "🌐 Starting server on port ${PORT:-3001}..."
npm start
