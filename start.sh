#!/bin/bash

# Ensure script stops on first error
set -e

echo "=========================================="
echo "   Starting MediScanAI-Heart System       "
echo "=========================================="

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 could not be found. Please install Python 3."
    exit 1
fi

# Check for npm (Node.js)
if ! command -v npm &> /dev/null; then
    echo "Error: npm could not be found. Please install Node.js."
    exit 1
fi

echo ">> Step 1: Installing backend dependencies..."
python3 -m pip install -r requirements.txt

# Note: The run.py script already includes logic to automatically run `npm install` 
# for the frontend if node_modules is missing, and it spawns the Next.js frontend 
# process in the background before starting the Flask server.

echo ">> Step 2: Starting the backend and frontend..."
echo "(The script will automatically open your web browser once ready)"
python3 run.py
