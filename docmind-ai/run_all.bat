@echo off
echo ========================================================
echo           Starting DocMind AI Services...
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_all.ps1"
pause
