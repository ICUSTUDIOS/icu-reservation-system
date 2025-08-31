@echo off
echo ============================================
echo MCP Setup for Claude Deployment Automation
echo ============================================
echo.

:: Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Installing MCP servers...
echo.

echo Installing GitHub MCP server...
call npm install -g @modelcontextprotocol/server-github

echo Installing Git MCP server...
call npm install -g @modelcontextprotocol/server-git

echo Installing Filesystem MCP server...
call npm install -g @modelcontextprotocol/server-filesystem

echo Installing Supabase MCP server...
call npm install -g @supabase/mcp-server-supabase

echo.
echo [2/5] Token Configuration
echo -------------------------
echo.

:: GitHub Token
echo 1. GitHub Personal Access Token
echo    Get it from: https://github.com/settings/tokens
echo    Required scopes: repo, workflow
set /p GITHUB_TOKEN="Enter GitHub token (ghp_...): "

:: Supabase Token
echo.
echo 2. Supabase Access Token
echo    Get it from: https://app.supabase.com/account/tokens
set /p SUPABASE_TOKEN="Enter Supabase token: "

:: Render API Key
echo.
echo 3. Render API Key (Optional - for automated deployment)
echo    Get it from: https://dashboard.render.com/account/api-keys
set /p RENDER_KEY="Enter Render API key (or press Enter to skip): "

:: Create config directory
echo.
echo [3/5] Creating configuration directory...
if not exist "%APPDATA%\Claude" mkdir "%APPDATA%\Claude"

:: Create configuration file
echo [4/5] Creating Claude configuration...
(
echo {
echo   "mcpServers": {
echo     "github": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-github"],
echo       "env": {
echo         "GITHUB_PERSONAL_ACCESS_TOKEN": "%GITHUB_TOKEN%"
echo       }
echo     },
echo     "git": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-git"],
echo       "cwd": "%cd%"
echo     },
echo     "filesystem": {
echo       "command": "npx",
echo       "args": [
echo         "-y",
echo         "@modelcontextprotocol/server-filesystem",
echo         "%cd%"
echo       ]
echo     },
echo     "supabase": {
echo       "command": "npx",
echo       "args": ["-y", "@supabase/mcp-server-supabase"],
echo       "env": {
echo         "SUPABASE_ACCESS_TOKEN": "%SUPABASE_TOKEN%"
echo       }
echo     }
echo   }
echo }
) > "%APPDATA%\Claude\claude_desktop_config.json"

:: Create .env.mcp file
echo [5/5] Creating environment file...
(
echo # MCP Configuration
echo # Generated on %date% %time%
echo.
echo # GitHub
echo GITHUB_TOKEN=%GITHUB_TOKEN%
echo GITHUB_OWNER=relaxshadow
echo GITHUB_REPO=icu_reservation_system
echo.
echo # Supabase
echo SUPABASE_TOKEN=%SUPABASE_TOKEN%
echo SUPABASE_PROJECT_ID=jkcsowmshwhpeejwfmph
echo.
echo # Render
echo RENDER_API_KEY=%RENDER_KEY%
echo.
echo # Project paths
echo PROJECT_PATH=%cd%
) > .env.mcp

echo.
echo =============================================
echo MCP Setup Complete!
echo =============================================
echo.
echo Next steps:
echo 1. Restart Claude Desktop
echo 2. Claude will now have access to:
echo    - GitHub (push, create repos, manage)
echo    - Supabase (database operations)
echo    - File system (read/write files)
echo    - Git (version control)
if not "%RENDER_KEY%"=="" echo    - Render (deployment)
echo.
echo Claude can now deploy your app automatically!
echo.
echo Security: Keep your .env.mcp file private!
echo.
pause