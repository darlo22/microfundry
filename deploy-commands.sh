#!/bin/bash

echo "Deploying complete Fundry platform..."

git add .

git commit -m "Deploy full Fundry investment platform with all functionalities"

git push origin main

echo "Deployment initiated - microfundry.com will show complete platform"