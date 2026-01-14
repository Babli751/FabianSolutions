#!/bin/bash
# Install backend dependencies

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Setup complete! Database will be created automatically on first run."
echo ""
echo "To start the backend:"
echo "  uvicorn app.main:app --reload"
