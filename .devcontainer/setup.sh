#!/bin/bash
set -e

echo "Setting up development environment..."

# Install pnpm
echo "Installing pnpm..."
npm install -g pnpm

# Install project dependencies
echo "Installing project dependencies..."
pnpm install

echo "Setup complete!"
