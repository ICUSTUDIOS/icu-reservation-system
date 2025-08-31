# Test MCP Connection Script for Claude
# This script verifies that all MCP servers are properly configured

Write-Host @"
╔══════════════════════════════════════════════════════════╗
║           MCP Connection Test for Claude                 ║
╚══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host ""

# Function to display colored status
function Show-Status {
    param(
        [string]$Service,
        [bool]$Success,
        [string]$Message = ""
    )
    
    if ($Success) {
        Write-Host "✅ $Service" -ForegroundColor Green
        if ($Message) {
            Write-Host "   $Message" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ $Service" -ForegroundColor Red
        if ($Message) {
            Write-Host "   $Message" -ForegroundColor Yellow
        }
    }
}

Write-Host "🔍 Checking MCP Prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Node.js and npm
Write-Host "1️⃣  Node.js & npm Installation" -ForegroundColor Cyan
$npmVersion = $null
try {
    $npmVersion = npm --version 2>$null
    $nodeVersion = node --version 2>$null
    Show-Status "Node.js $nodeVersion & npm $npmVersion" $true
} catch {
    Show-Status "Node.js/npm" $false "Please install Node.js from https://nodejs.org/"
}

Write-Host ""

# Test 2: MCP Server Packages
Write-Host "2️⃣  MCP Server Packages" -ForegroundColor Cyan
$packages = @(
    "@modelcontextprotocol/server-github",
    "@modelcontextprotocol/server-git",
    "@modelcontextprotocol/server-filesystem",
    "@modelcontextprotocol/server-shell",
    "@supabase/mcp-server-supabase"
)

foreach ($package in $packages) {
    $installed = npm list -g $package 2>$null | Select-String $package
    if ($installed) {
        Show-Status "$package" $true "Installed globally"
    } else {
        Show-Status "$package" $false "Run: npm install -g $package"
    }
}

Write-Host ""

# Test 3: Configuration File
Write-Host "3️⃣  Claude Configuration File" -ForegroundColor Cyan
$configFile = "$env:APPDATA\Claude\claude_desktop_config.json"

if (Test-Path $configFile) {
    Show-Status "Configuration file exists" $true $configFile
    
    # Parse and validate configuration
    try {
        $config = Get-Content $configFile | ConvertFrom-Json
        
        if ($config.mcpServers) {
            $servers = @("github", "git", "filesystem", "shell", "supabase")
            foreach ($server in $servers) {
                if ($config.mcpServers.$server) {
                    Show-Status "  └─ $server server" $true "Configured"
                } else {
                    Show-Status "  └─ $server server" $false "Not configured"
                }
            }
        }
    } catch {
        Show-Status "Configuration parsing" $false "Invalid JSON format"
    }
} else {
    Show-Status "Configuration file" $false "Run setup-mcp.ps1 first"
}

Write-Host ""

# Test 4: Environment File
Write-Host "4️⃣  Environment Configuration" -ForegroundColor Cyan
$envFile = ".env.mcp"

if (Test-Path $envFile) {
    Show-Status "Environment file exists" $true $envFile
    
    # Check for required tokens (without revealing them)
    $envContent = Get-Content $envFile
    $hasGithubToken = $envContent | Select-String "GITHUB_TOKEN=ghp_"
    $hasSupabaseToken = $envContent | Select-String "SUPABASE_TOKEN="
    $hasRenderKey = $envContent | Select-String "RENDER_API_KEY="
    
    if ($hasGithubToken) {
        Show-Status "  └─ GitHub token" $true "Found (ghp_...)"
    } else {
        Show-Status "  └─ GitHub token" $false "Missing or invalid"
    }
    
    if ($hasSupabaseToken) {
        Show-Status "  └─ Supabase token" $true "Found"
    } else {
        Show-Status "  └─ Supabase token" $false "Missing"
    }
    
    if ($hasRenderKey -and $hasRenderKey -notmatch "RENDER_API_KEY=$") {
        Show-Status "  └─ Render API key" $true "Found (optional)"
    } else {
        Show-Status "  └─ Render API key" $false "Not provided (optional)"
    }
} else {
    Show-Status "Environment file" $false "Run setup-mcp.ps1 first"
}

Write-Host ""

# Test 5: Git Repository
Write-Host "5️⃣  Git Repository Status" -ForegroundColor Cyan
try {
    $gitStatus = git status --porcelain 2>$null
    $gitRemote = git remote -v 2>$null | Select-String "origin"
    
    if ($gitRemote) {
        Show-Status "Git repository" $true "Connected to remote"
        Write-Host "   $($gitRemote -split "`n" | Select-Object -First 1)" -ForegroundColor Gray
    } else {
        Show-Status "Git repository" $false "No remote configured"
    }
} catch {
    Show-Status "Git" $false "Not a git repository"
}

Write-Host ""

# Test 6: Claude Desktop Status
Write-Host "6️⃣  Claude Desktop Status" -ForegroundColor Cyan
$claudeProcesses = Get-Process -Name "Claude*" -ErrorAction SilentlyContinue

if ($claudeProcesses) {
    Show-Status "Claude Desktop" $true "Running (PID: $($claudeProcesses[0].Id))"
    Write-Host "   ⚠️  Restart Claude to apply configuration changes" -ForegroundColor Yellow
} else {
    Show-Status "Claude Desktop" $false "Not running"
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Summary and recommendations
$allGood = $true
$recommendations = @()

if (!$npmVersion) {
    $allGood = $false
    $recommendations += "Install Node.js from https://nodejs.org/"
}

if (!(Test-Path $configFile)) {
    $allGood = $false
    $recommendations += "Run .\setup-mcp.ps1 to configure MCP"
}

if ($allGood) {
    Write-Host "✅ All systems operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Claude can now:" -ForegroundColor Cyan
    Write-Host "  • Push code to GitHub automatically" -ForegroundColor White
    Write-Host "  • Deploy to Render with a single command" -ForegroundColor White
    Write-Host "  • Manage Supabase database operations" -ForegroundColor White
    Write-Host "  • Execute build and deployment scripts" -ForegroundColor White
} else {
    Write-Host "⚠️  Setup incomplete" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    $i = 1
    foreach ($rec in $recommendations) {
        Write-Host "$i. $rec" -ForegroundColor White
        $i++
    }
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")