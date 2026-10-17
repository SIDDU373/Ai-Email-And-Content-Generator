@echo off
echo ============================================================
echo   WriteFlow AI - Starting Backend and Frontend Services
echo ============================================================
echo.
echo Starting Python Backend on http://localhost:8000 ...
start "WriteFlow Backend (Port 8000)" cmd /k "python run.py"

echo Starting Next.js Frontend on http://localhost:3000 ...
start "WriteFlow Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================================
echo   Both services launched!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ============================================================
