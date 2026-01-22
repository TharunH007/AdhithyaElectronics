#!/bin/bash

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Start backend server
cd backend
npm install
node index.js
