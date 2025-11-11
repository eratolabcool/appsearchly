#!/bin/bash

# App Search MVP Build Script

echo "🏗️  Building App Search MVP for production..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build dist

# Set production environment
export NODE_ENV=production

# Copy search configuration
echo "📋 Setting up production configuration..."
cp package-search.json package.json

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run type checking
echo "🔍 Running type checking..."
npm run check || {
    echo "❌ Type checking failed!"
    exit 1
}

# Build the application
echo "🚀 Building application..."
npm run build || {
    echo "❌ Build failed!"
    exit 1
}

# Create a production-ready HTML file
echo "📄 Creating production HTML entry..."
cp index-search.html build/index.html

# Create deployment info
echo "📋 Creating deployment info..."
cat > build/deployment-info.json << EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
  "version": "$(node -p "require('./package.json').version")",
  "nodeVersion": "$(node -v)",
  "environment": "production"
}
EOF

# Create a simple .nojekyll file for GitHub Pages
touch build/.nojekyll

# Create a simple robots.txt
cat > build/robots.txt << EOF
User-agent: *
Allow: /

# Sitemap
Sitemap: https://your-domain.com/sitemap.xml
EOF

echo "✅ Build completed successfully!"
echo "📁 Build output: ./build/"
echo "🌐 To preview locally: npm run preview"
echo "🚀 To deploy: Upload the 'build' folder to your hosting provider"

# Show build size
echo "📊 Build size information:"
du -sh build/

echo ""
echo "🎯 Next steps:"
echo "1. Test the build locally with: npm run preview"
echo "2. Deploy to your preferred hosting platform"
echo "3. Configure domain and SSL"
echo "4. Set up analytics and monitoring"
echo "5. Configure affiliate marketing links"