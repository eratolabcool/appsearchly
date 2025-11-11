#!/bin/bash

# Test Script for App Search MVP

echo "🧪 Testing App Search MVP..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Run type check
echo "🔍 Running type check..."
npm run check
if [ $? -ne 0 ]; then
    echo "⚠️  Type check failed, but continuing..."
fi

# Build the project
echo "🏗️  Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Start the development server
echo "🚀 Starting development server..."
echo "📱 App will be available at: http://localhost:5173"
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Start the dev server
npm run dev