#!/bin/bash

echo "Pushing Fundry platform updates..."

git add .

git commit -m "Deploy complete Fundry investment platform with all functionalities"

git push origin main

echo "Push complete - Full Fundry platform deploying to microfundry.com"