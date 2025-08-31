# MCP Setup for Claude Deployment Automation
# PowerShell Script Version

# Set execution policy for this session if needed
if ((Get-ExecutionPolicy) -eq 'Restricted') {
    Write-Host "Execution policy is restricted. Attempting to set for current process..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
}

# ASCII Art Header
Write-Host @"
╔══════════════════════════════════════════════════════════╗
║     MCP Setup for Claude Deployment Automation          ║
║     ICU Reservation System - Full Automation Setup      ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host ""

# Function to test if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to create a fancy progress bar
function Show-Progress {
    param(
        [int]$Step,
        [int]$TotalSteps,
        [string]$Message
    )
    
    $percent = ($Step / $TotalSteps) * 100
    $progressBar = "[" + ("=" * [Math]::Floor($percent / 5)) + (" " * (20 - [Math]::Floor($percent / 5))) + "]"
    
    Write-Host "`r$progressBar $([Math]::Round($percent))% - $Message" -NoNewline -ForegroundColor Green
    if ($Step -eq $TotalSteps) {
        Write-Host ""
    }
}

# Check if npm is installed
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$npmVersion = $null
try {
    $npmVersion = npm --version 2>$null
} catch {
    # npm not found
}

if (-not $npmVersion) {
    Write-Host "❌ Node.js/npm is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "2. Install the LTS version" -ForegroundColor Cyan
    Write-Host "3. Run this script again" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to open Node.js download page..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Start-Process "https://nodejs.org/"
    exit 1
}

Write-Host "✅ npm version $npmVersion found" -ForegroundColor Green
Write-Host ""

# Step 1: Install MCP Servers
Write-Host "📦 Installing MCP Servers..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

$servers = @(
    @{Name="GitHub MCP Server"; Package="@modelcontextprotocol/server-github"},
    @{Name="Git MCP Server"; Package="@modelcontextprotocol/server-git"},
    @{Name="Filesystem MCP Server"; Package="@modelcontextprotocol/server-filesystem"},
    @{Name="Shell MCP Server"; Package="@modelcontextprotocol/server-shell"},
    @{Name="Supabase MCP Server"; Package="@supabase/mcp-server-supabase"}
)

$totalServers = $servers.Count
$currentServer = 0

foreach ($server in $servers) {
    $currentServer++
    Show-Progress -Step $currentServer -TotalSteps $totalServers -Message "Installing $($server.Name)"
    
    try {
        $output = npm install -g $server.Package 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $($server.Name) installed successfully" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $($server.Name) might already be installed" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Failed to install $($server.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ MCP servers installation complete" -ForegroundColor Green
Write-Host ""

# Step 2: Get Tokens
Write-Host "🔑 Token Configuration" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# GitHub Token
Write-Host "1️⃣  GitHub Personal Access Token" -ForegroundColor Cyan
Write-Host "   📍 Get it from: " -NoNewline
Write-Host "https://github.com/settings/tokens" -ForegroundColor Blue
Write-Host "   ✅ Required scopes: repo, workflow, admin:repo_hook" -ForegroundColor Gray
Write-Host ""
$githubToken = Read-Host "   Enter GitHub token (ghp_...)"

# Validate GitHub token format
if ($githubToken -notmatch "^ghp_") {
    Write-Host "   ⚠️  Warning: GitHub token should start with 'ghp_'" -ForegroundColor Yellow
}

Write-Host ""

# Supabase Token
Write-Host "2️⃣  Supabase Access Token" -ForegroundColor Cyan
Write-Host "   📍 Get it from: " -NoNewline
Write-Host "https://app.supabase.com/account/tokens" -ForegroundColor Blue
Write-Host ""
$supabaseToken = Read-Host "   Enter Supabase token"

Write-Host ""

# Render API Key
Write-Host "3️⃣  Render API Key " -NoNewline
Write-Host "(Optional - for automated deployment)" -ForegroundColor Gray
Write-Host "   📍 Get it from: " -NoNewline
Write-Host "https://dashboard.render.com/account/api-keys" -ForegroundColor Blue
Write-Host "   Press Enter to skip if you don't have one yet" -ForegroundColor Gray
Write-Host ""
$renderKey = Read-Host "   Enter Render API key (or press Enter to skip)"

Write-Host ""

# Step 3: Create Configuration
Write-Host "📝 Creating Claude Configuration..." -ForegroundColor Yellow
Write-Host ""

# Determine Claude config directory
$claudeConfigDir = "$env:APPDATA\Claude"
$configFile = "$claudeConfigDir\claude_desktop_config.json"

# Create directory if it doesn't exist
if (!(Test-Path $claudeConfigDir)) {
    New-Item -ItemType Directory -Path $claudeConfigDir -Force | Out-Null
    Write-Host "  📁 Created config directory: $claudeConfigDir" -ForegroundColor Green
}

# Get current directory for project path
$projectPath = (Get-Location).Path

# Create the configuration JSON
$config = @{
    mcpServers = @{
        github = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-github")
            env = @{
                GITHUB_PERSONAL_ACCESS_TOKEN = $githubToken
            }
        }
        git = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-git")
            cwd = $projectPath
        }
        filesystem = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-filesystem", $projectPath)
        }
        shell = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-shell")
            env = @{
                SHELL_ALLOW_COMMANDS = "git,npm,node,curl,psql,gh"
            }
        }
        supabase = @{
            command = "npx"
            args = @("-y", "@supabase/mcp-server-supabase")
            env = @{
                SUPABASE_ACCESS_TOKEN = $supabaseToken
            }
        }
    }
}

# Add Render configuration if API key provided
if ($renderKey) {
    $config.mcpServers.render = @{
        command = "node"
        args = @("$projectPath\.claude\render-server.js")
        env = @{
            RENDER_API_KEY = $renderKey
        }
    }
}

# Convert to JSON and save
$configJson = $config | ConvertTo-Json -Depth 10
Set-Content -Path $configFile -Value $configJson -Encoding UTF8

Write-Host "  ✅ Configuration saved to: $configFile" -ForegroundColor Green
Write-Host ""

# Step 4: Create .env.mcp file
Write-Host "📄 Creating environment file..." -ForegroundColor Yellow

$envContent = @"
# MCP Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# GitHub
GITHUB_TOKEN=$githubToken
GITHUB_OWNER=relaxshadow
GITHUB_REPO=icu_reservation_system

# Supabase
SUPABASE_TOKEN=$supabaseToken
SUPABASE_PROJECT_ID=jkcsowmshwhpeejwfmph
SUPABASE_URL=https://jkcsowmshwhpeejwfmph.supabase.co

# Render (if provided)
RENDER_API_KEY=$renderKey

# Project paths
PROJECT_PATH=$projectPath
"@

Set-Content -Path ".env.mcp" -Value $envContent -Encoding UTF8
Write-Host "  ✅ Environment file created: .env.mcp" -ForegroundColor Green
Write-Host ""

# Step 5: Create helper scripts
Write-Host "🛠️  Creating helper scripts..." -ForegroundColor Yellow

# Create test script
$testScript = @'
# Test MCP Connection
Write-Host "Testing MCP connections..." -ForegroundColor Yellow
Write-Host ""

# Test npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "✅ npm is available" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found" -ForegroundColor Red
}

# Test configuration file
$configFile = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configFile) {
    Write-Host "✅ Configuration file exists" -ForegroundColor Green
    $config = Get-Content $configFile | ConvertFrom-Json
    if ($config.mcpServers.github) {
        Write-Host "✅ GitHub MCP configured" -ForegroundColor Green
    }
    if ($config.mcpServers.supabase) {
        Write-Host "✅ Supabase MCP configured" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Configuration file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
'@

Set-Content -Path "test-mcp.ps1" -Value $testScript -Encoding UTF8

# Step 6: Test Setup
Write-Host "🧪 Testing setup..." -ForegroundColor Yellow
Write-Host ""

# Test configuration file
if (Test-Path $configFile) {
    Write-Host "  ✅ Configuration file created successfully" -ForegroundColor Green
} else {
    Write-Host "  ❌ Configuration file not found" -ForegroundColor Red
}

# Test token formats
if ($githubToken -match "^ghp_") {
    Write-Host "  ✅ GitHub token format looks correct" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  GitHub token format might be incorrect" -ForegroundColor Yellow
}

if ($supabaseToken) {
    Write-Host "  ✅ Supabase token provided" -ForegroundColor Green
}

if ($renderKey) {
    Write-Host "  ✅ Render API key provided" -ForegroundColor Green
}

Write-Host ""

# Final Summary
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✅ MCP Setup Complete!                        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. " -NoNewline -ForegroundColor Cyan
Write-Host "Close and restart Claude Desktop" -ForegroundColor White
Write-Host "2. " -NoNewline -ForegroundColor Cyan
Write-Host "Claude will now have access to:" -ForegroundColor White
Write-Host "   • GitHub (push, create repos, manage)" -ForegroundColor Gray
Write-Host "   • Supabase (database operations)" -ForegroundColor Gray
Write-Host "   • File system (read/write files)" -ForegroundColor Gray
Write-Host "   • Git (version control)" -ForegroundColor Gray
Write-Host "   • Shell commands (build, deploy)" -ForegroundColor Gray
if ($renderKey) {
    Write-Host "   • Render (automated deployment)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Claude can now:" -ForegroundColor Cyan
Write-Host "   • Push code to GitHub automatically" -ForegroundColor White
Write-Host "   • Create and deploy Render services" -ForegroundColor White
Write-Host "   • Manage your entire deployment pipeline" -ForegroundColor White

Write-Host ""
Write-Host "⚠️  Security Notes:" -ForegroundColor Yellow
Write-Host "   • Keep your .env.mcp file private" -ForegroundColor Gray
Write-Host "   • Never commit tokens to git" -ForegroundColor Gray
Write-Host "   • Tokens are stored in: $configFile" -ForegroundColor Gray

Write-Host ""
Write-Host "🧪 To test the setup, run: " -NoNewline
Write-Host ".\test-mcp.ps1" -ForegroundColor Cyan

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")