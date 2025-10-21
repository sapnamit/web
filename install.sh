#!/bin/bash

# Smart Assistant Browser - Installation Script
# This script installs dependencies and prepares the browser for use

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        Smart Assistant Browser - Installation            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
echo "🔍 Checking for Node.js..."
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    echo "Recommended version: 14.x or higher"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js is installed: $NODE_VERSION"
echo ""

# Check if npm is installed
echo "🔍 Checking for npm..."
if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed."
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm is installed: $NPM_VERSION"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║          ✅ Installation Successful!                      ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "🚀 To start the browser, run:"
    echo ""
    echo "   npm start"
    echo ""
    echo "📖 For more information, see:"
    echo "   - README.md"
    echo "   - GETTING_STARTED.md"
    echo ""
else
    echo ""
    echo "❌ Installation failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi
