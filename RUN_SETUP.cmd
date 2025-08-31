@echo off
:: Simple launcher for MCP setup
:: Just double-click this file to run the setup

echo Starting MCP Setup for Claude...
echo.

:: Check if PowerShell is available
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PowerShell is not available.
    echo Please install PowerShell or use setup-mcp.bat instead.
    pause
    exit /b 1
)

:: Run the PowerShell setup script
powershell -ExecutionPolicy Bypass -File ".\setup-mcp.ps1"

:: If PowerShell fails, try the batch file
if %errorlevel% neq 0 (
    echo.
    echo PowerShell script failed. Trying batch file...
    echo.
    call setup-mcp.bat
)