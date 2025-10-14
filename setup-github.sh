#!/bin/bash

echo "🚀 Uni-Market GitHub Setup Script"
echo "=================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "📝 Please enter your GitHub username:"
read -p "Username: " github_username

if [ -z "$github_username" ]; then
    echo "❌ Username cannot be empty"
    exit 1
fi

echo ""
echo "🔧 Initializing Git repository..."
git init

echo ""
echo "📦 Adding all files..."
git add .

echo ""
echo "💾 Creating initial commit..."
git commit -m "Initial commit - Uni-Market application"

echo ""
echo "🔗 Adding GitHub remote..."
git remote add origin https://github.com/$github_username/uni-market.git

echo ""
echo "🌿 Setting main branch..."
git branch -M main

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://github.com/new"
echo "2. Create a repository named: uni-market"
echo "3. DO NOT initialize with README"
echo "4. Then run: git push -u origin main"
echo ""
echo "Or run this command now:"
echo "   git push -u origin main"
echo ""
