#!/bin/bash

# App Search MVP Startup Script

echo "🚀 Starting App Search MVP..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version (no external dependencies)
NODE_VERSION=$(node -v | sed 's/^v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)
REQUIRED_MAJOR=18

if [ "$NODE_MAJOR" -lt "$REQUIRED_MAJOR" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to version 18 or higher."
    exit 1
fi

# Check if package-search.json exists
if [ ! -f "package-search.json" ]; then
    echo "❌ package-search.json not found!"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --package-lock-only
    npm install
fi

# Ensure Vite is available (in case node_modules exists but dependencies differ)
if [ ! -f "node_modules/.bin/vite" ]; then
    echo "📦 Installing dependencies (vite missing)..."
    npm install
fi

# Copy the search package.json as the main one for development
echo "📋 Setting up search configuration..."
cp package-search.json package.json.temp
cp package-search.json package.json

# Set environment variables for development
export NODE_ENV=development
export VITE_APPLE_AFFILIATE_TOKEN="appsearch"
export VITE_APPLE_CAMPAIGN_ID="appsearch-web"
export VITE_GOOGLE_AFFILIATE_ID="appsearch"
export VITE_GOOGLE_CAMPAIGN_ID="appsearch_web"
export SASS_PATH="src/styles"

# Generate SvelteKit internal files
echo "🔧 Generating SvelteKit files..."
npx svelte-kit sync || {
    echo "❌ svelte-kit sync failed!"
    exit 1
}

# Start the development server
echo "🌐 Starting development server..."
echo "📱 App Search will be available at: http://localhost:5173"
echo "🔍 Use the search interface to test the MVP"
echo "⏹️  Press Ctrl+C to stop the server"

# Run the development server
npm run dev

# Cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    if [ -f "package.json.temp" ]; then
        mv package.json.temp package.json
    fi
    echo "✅ Cleanup completed. Goodbye!"
}

# Set up cleanup trap
trap cleanup EXIT

# Wait for the server to be stopped
wait