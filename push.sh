#!/bin/bash

echo "Pushing Fundry platform updates..."

git add .

git commit -m "Restore full Fundry React platform - complete investment functionality"

git push origin main

echo "Push complete - Vercel will deploy the full platform"