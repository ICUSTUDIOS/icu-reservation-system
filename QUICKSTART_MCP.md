# 🚀 Quick Start - MCP Setup in 2 Minutes

## Step 1: Run Setup (Choose One)

### Option A: Double-Click (Easiest)
```
📁 Double-click: RUN_SETUP.cmd
```

### Option B: PowerShell
```powershell
.\setup-mcp.ps1
```

### Option C: Command Prompt
```cmd
setup-mcp.bat
```

## Step 2: Get Your Tokens

### 1. GitHub Token (Required)
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Claude MCP"
4. Select these permissions:
   - ✅ repo (all)
   - ✅ workflow
   - ✅ admin:repo_hook
5. Generate & Copy token (starts with `ghp_`)

### 2. Supabase Token (Required)
1. Go to: https://app.supabase.com/account/tokens
2. Click "Generate new token"
3. Name: "Claude MCP"
4. Copy the token

### 3. Render API Key (Optional)
1. Go to: https://dashboard.render.com/account/api-keys
2. Click "Create API Key"
3. Name: "Claude MCP"
4. Copy the key

## Step 3: Enter Tokens When Prompted
The setup script will ask for each token. Paste them when requested.

## Step 4: Restart Claude Desktop
Close and reopen Claude Desktop to load the new configuration.

## Step 5: Test Your Setup
Say to Claude: "Check MCP status"

## That's It! 🎉

Claude can now:
- ✅ Push to GitHub automatically
- ✅ Deploy to Render instantly
- ✅ Manage your database
- ✅ Run any build/deploy commands

## Quick Commands for Claude

After setup, you can tell Claude:

```
"Deploy the app to Render"
"Push all changes to GitHub"
"Check deployment status"
"Run database migrations"
"Update environment variables"
```

## Troubleshooting

### "npm not found"
Install Node.js: https://nodejs.org/

### "Execution policy" error (PowerShell)
Run as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### Test Your Setup
```powershell
.\test-mcp.ps1
```

## Need Help?
Check the full guide: `MCP_SETUP_README.md`