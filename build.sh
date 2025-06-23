#!/bin/bash

# Optimized build script for Fundry platform
echo "Starting optimized production build..."

# Set memory limits and optimization flags
export NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=512"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist
rm -rf client/dist

# Build frontend with optimizations
echo "Building frontend..."
npx vite build --mode production

# Build backend
echo "Building backend..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --minify \
  --tree-shaking=true

echo "Build completed successfully!"
echo "Frontend built to: client/dist"
echo "Backend built to: dist"