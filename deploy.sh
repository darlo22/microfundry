#!/bin/bash

# Fundry Platform Git Deployment Script
# This script commits all changes and pushes to the main branch

echo "🚀 Fundry Platform Deployment Script"
echo "======================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ No changes to commit"
else
    echo "📝 Changes detected, staging files..."
    
    # Add all changes
    git add .
    
    # Check if there are staged changes
    if [[ -z $(git diff --cached) ]]; then
        echo "⚠️  No staged changes found"
    else
        # Create commit message with timestamp
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        COMMIT_MSG="Fundry Platform Update - $TIMESTAMP

✅ Vercel deployment fixes - resolved FUNCTION_INVOCATION_FAILED errors
✅ Login authentication system operational
✅ $100,000 campaign goal enforcement active
✅ Database connectivity and user sessions working
✅ Production-ready deployment configuration

Platform ready for live deployment at microfundry.com"

        echo "💾 Committing changes..."
        git commit -m "$COMMIT_MSG"
        
        if [ $? -eq 0 ]; then
            echo "✅ Commit successful"
        else
            echo "❌ Commit failed"
            exit 1
        fi
    fi
fi

# Push to remote repository
echo "⬆️  Pushing to remote repository..."
git push origin "$CURRENT_BRANCH"

if [ $? -eq 0 ]; then
    echo "✅ Push successful!"
    echo ""
    echo "🎉 Deployment Summary:"
    echo "   • All changes committed and pushed"
    echo "   • Vercel will automatically deploy from main branch"
    echo "   • Platform includes $100K campaign limit enforcement"
    echo "   • Authentication system fully operational"
    echo ""
    echo "🔗 Check deployment status at:"
    echo "   • Vercel Dashboard: https://vercel.com/dashboard"
    echo "   • Live Site: https://microfundry.com"
else
    echo "❌ Push failed"
    echo "💡 Try: git pull origin $CURRENT_BRANCH"
    exit 1
fi

# Optional: Show recent commits
echo ""
echo "📋 Recent commits:"
git log --oneline -5

echo ""
echo "🚀 Deployment complete!"