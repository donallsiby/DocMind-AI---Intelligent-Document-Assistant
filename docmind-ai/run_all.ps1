# Startup script for DocMind AI
$Root = $PSScriptRoot

Write-Host "Starting RAG Service (FastAPI) on port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\rag-service'; .\venv\Scripts\python.exe main.py"

Write-Host "Starting Backend Gateway (Node.js/Express) on port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\backend'; npm run dev"

Write-Host "Starting Frontend (Vite/React) on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\frontend'; npm run dev"

Write-Host "All services launched in separate windows!" -ForegroundColor Green
Write-Host "Open http://localhost:5173 in your browser." -ForegroundColor Yellow
