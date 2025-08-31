# 🚀 MCP Setup - Enable Claude Full Automation

## Quick Start (Windows)

### Option 1: Easiest - Just Double-Click
```
📁 Double-click: RUN_SETUP.cmd
```

### Option 2: PowerShell (Recommended)
```powershell
# Right-click on Windows Start → Windows PowerShell
# Navigate to project folder, then run:
.\setup-mcp.ps1
```

### Option 3: Command Prompt
```cmd
# Open Command Prompt and run:
setup-mcp.bat
```

## Quick Start (Mac/Linux)
```bash
# Open Terminal and run:
./setup-mcp.sh
```

## What This Does

Once you run the setup, Claude will be able to:

✅ **Push code to GitHub** - No manual git commands needed
✅ **Deploy to Render** - Automatic service creation and deployment  
✅ **Manage Supabase** - Database operations and migrations
✅ **Execute commands** - Build, test, and deploy your app
✅ **Full automation** - Just tell Claude what you want!

## Prerequisites

1. **Node.js** - [Download here](https://nodejs.org/) if not installed
2. **GitHub Account** - For code repository
3. **Render Account** - For hosting (free tier available)
4. **Supabase Project** - Your existing database

## Required Tokens

The setup script will ask for these:

### 1. GitHub Personal Access Token
- Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Name: "Claude MCP"
- Scopes needed:
  - ✅ repo (all)
  - ✅ workflow
  - ✅ admin:repo_hook
- Copy the token (starts with `ghp_`)

### 2. Supabase Access Token  
- Go to: https://app.supabase.com/account/tokens
- Click "Generate new token"
- Name: "Claude MCP"
- Copy the token

### 3. Render API Key (Optional but recommended)
- Go to: https://dashboard.render.com/account/api-keys
- Click "Create API Key"
- Name: "Claude MCP"
- Copy the key

## Step-by-Step Instructions

### For Windows Users:

1. **Get your tokens ready** (see above)

2. **Run the setup:**
   - Easy way: Double-click `RUN_SETUP.cmd`
   - OR PowerShell: Run `.\setup-mcp.ps1`
   - OR Command Prompt: Run `setup-mcp.bat`

3. **Enter your tokens** when prompted

4. **Restart Claude Desktop**

5. **Done!** Claude now has full deployment capabilities

### For Mac/Linux Users:

1. **Get your tokens ready** (see above)

2. **Open Terminal** in the project directory

3. **Run the setup:**
   ```bash
   chmod +x setup-mcp.sh
   ./setup-mcp.sh
   ```

4. **Enter your tokens** when prompted

5. **Restart Claude Desktop**

6. **Done!** Claude now has full deployment capabilities

## Testing the Setup

After setup, restart Claude and say:
- "Check MCP status"
- "Test GitHub connection"
- "Verify Supabase access"

## What Gets Installed

- GitHub MCP Server - Git operations
- Supabase MCP Server - Database management
- Filesystem MCP Server - File operations
- Shell MCP Server - Command execution
- Git MCP Server - Version control

## Configuration Files Created

- `~\AppData\Roaming\Claude\claude_desktop_config.json` (Windows)
- `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac)
- `~/.config/claude/claude_desktop_config.json` (Linux)
- `.env.mcp` - Local environment variables (gitignored)

## Troubleshooting

### "npm not found" error
- Install Node.js from https://nodejs.org/
- Restart your terminal/command prompt
- Run setup again

### "Execution policy" error (PowerShell)
- Run PowerShell as Administrator
- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine`
- Try setup again

### Claude doesn't see MCP servers
- Make sure you restarted Claude Desktop
- Check the config file was created correctly
- Verify tokens are valid

### Tokens not working
- GitHub token must start with `ghp_`
- Make sure you selected the right permissions
- Tokens might have expired - generate new ones

## Security Notes

⚠️ **Important:**
- Never share your tokens
- Don't commit `.env.mcp` to git
- Tokens are stored locally in your Claude config
- Rotate tokens periodically for security

## After Setup

Once configured, you can tell Claude things like:
- "Deploy the app to Render"
- "Push all changes to GitHub"
- "Create a new database migration"
- "Update environment variables on Render"
- "Check deployment status"

And Claude will handle everything automatically!

## Need Help?

1. Check if all tokens are correct
2. Restart Claude Desktop
3. Run `.\test-mcp.ps1` (Windows) or `./test-mcp.sh` (Mac/Linux)
4. Make sure Node.js is installed
5. Try running setup as Administrator (Windows)

---

**Time Required:** 5 minutes total
**Difficulty:** Easy (just follow prompts)
**Result:** Full automation capabilities for Claude!