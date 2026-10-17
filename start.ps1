Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  WriteFlow AI - Starting Backend and Frontend Services" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Python FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python run.py"

Write-Host "Starting Next.js Frontend on http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Both services launched in separate windows!" -ForegroundColor Green
Write-Host "  Open your browser to: http://localhost:3000" -ForegroundColor White
Write-Host "  FastAPI Documentation: http://localhost:8000/docs" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
