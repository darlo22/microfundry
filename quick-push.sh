#!/bin/bash

# Quick Git Push Script for Fundry Platform
# Usage: ./quick-push.sh "Your commit message"

# Default commit message if none provided
if [ -z "$1" ]; then
    MESSAGE="Fundry platform updates - $(date '+%Y-%m-%d %H:%M:%S')"
else
    MESSAGE="$1"
fi

echo "🔄 Quick Push: $MESSAGE"

# Stage all changes
git add .

# Commit with message
git commit -m "$MESSAGE"

# Push to main branch
git push origin main

echo "✅ Done!"