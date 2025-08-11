@echo off
echo Starting Telugu Bhasha Gyan Development Environment

echo Starting Backend Server...
start cmd /k "cd server && npm run dev"

echo Starting Frontend...
start cmd /k "npm run dev"

echo Development environment started!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:8080