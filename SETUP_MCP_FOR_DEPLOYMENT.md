# 🔧 Setting Up MCP for Full Deployment Automation

This guide will enable Claude to perform all deployment actions automatically.

## Prerequisites
- Node.js installed
- GitHub account
- Render account
- Supabase project

## Step 1: Get Your Tokens

### 1.1 GitHub Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "Claude MCP Access"
4. Select scopes:
   - ✅ repo (all)
   - ✅ workflow
   - ✅ admin:repo_hook
5. Click "Generate token"
6. **Copy the token** (starts with `ghp_`)

### 1.2 Supabase Access Token
1. Go to https://app.supabase.com/account/tokens
2. Click "Generate new token"
3. Name it: "Claude MCP"
4. **Copy the token**

### 1.3 Render API Key
1. Go to https://dashboard.render.com/account/api-keys
2. Click "Create API Key"
3. Name it: "Claude MCP"
4. **Copy the key**

## Step 2: Install MCP Servers

Run these commands in your project directory:

```bash
# Install MCP servers globally
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-shell
npm install -g @supabase/mcp-server-supabase

# Create MCP directory
mkdir -p ~/.config/claude/mcp
```

## Step 3: Configure Claude Desktop

### 3.1 Create the configuration file:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Mac:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/claude/claude_desktop_config.json
```

### 3.2 Add this configuration:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN_HERE"
      }
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"],
      "cwd": "/mnt/x/ICU Reservation System/icu_reservation_system"
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/mnt/x/ICU Reservation System/icu_reservation_system"
      ]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_SUPABASE_TOKEN_HERE"
      }
    },
    "render": {
      "command": "node",
      "args": ["/path/to/render-mcp-server.js"],
      "env": {
        "RENDER_API_KEY": "YOUR_RENDER_API_KEY_HERE"
      }
    }
  }
}
```

## Step 4: Create Render MCP Server

Create file: `~/.config/claude/mcp/render-server.js`

```javascript
#!/usr/bin/env node

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const RENDER_API_KEY = process.env.RENDER_API_KEY;
const API_BASE = 'https://api.render.com/v1';

// Create service endpoint
app.post('/create-service', async (req, res) => {
  try {
    const response = await axios.post(
      `${API_BASE}/services`,
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${RENDER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deploy endpoint
app.post('/deploy/:serviceId', async (req, res) => {
  try {
    const response = await axios.post(
      `${API_BASE}/services/${req.params.serviceId}/deploys`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${RENDER_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3456, () => {
  console.log('Render MCP Server running on port 3456');
});
```

## Step 5: Environment Variables Setup

Create `.env.mcp` in your project:

```bash
# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=relaxshadow
GITHUB_REPO=icu_reservation_system

# Render
RENDER_API_KEY=rnd_xxxxxxxxxxxxxxxxxxxx

# Supabase
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxx
SUPABASE_PROJECT_ID=jkcsowmshwhpeejwfmph
```

## Step 6: Test the Setup

After configuration, restart Claude Desktop and I should be able to:

1. **Push to GitHub:**
```
mcp_github_push_code
```

2. **Create Render Service:**
```
mcp_render_create_service
```

3. **Deploy:**
```
mcp_render_deploy
```

## Step 7: Quick Setup Script

Run this to automate the setup:

```bash
#!/bin/bash

# Create MCP directory
mkdir -p ~/.config/claude/mcp

# Install dependencies
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-git
npm install -g @supabase/mcp-server-supabase

# Create config template
cat > ~/.config/claude/setup-tokens.sh << 'EOF'
#!/bin/bash
echo "Enter your GitHub token:"
read GITHUB_TOKEN
echo "Enter your Render API key:"
read RENDER_KEY
echo "Enter your Supabase token:"
read SUPABASE_TOKEN

# Update config file
sed -i "s/YOUR_GITHUB_TOKEN_HERE/$GITHUB_TOKEN/g" ~/.config/claude/claude_desktop_config.json
sed -i "s/YOUR_RENDER_API_KEY_HERE/$RENDER_KEY/g" ~/.config/claude/claude_desktop_config.json
sed -i "s/YOUR_SUPABASE_TOKEN_HERE/$SUPABASE_TOKEN/g" ~/.config/claude/claude_desktop_config.json

echo "✅ Tokens configured successfully!"
EOF

chmod +x ~/.config/claude/setup-tokens.sh
echo "Run: ~/.config/claude/setup-tokens.sh to complete setup"
```

## What This Enables

Once configured, I'll be able to:

✅ **Push code to GitHub** directly
✅ **Create Render services** programmatically
✅ **Deploy applications** with one command
✅ **Update environment variables** automatically
✅ **Monitor deployment status**
✅ **Manage Supabase** database
✅ **Execute shell commands** for builds

## Security Notes

- Store tokens securely
- Use environment variables, not hardcoded values
- Rotate tokens regularly
- Limit token permissions to minimum required
- Never commit tokens to git

## Troubleshooting

If MCP doesn't work:
1. Check token permissions
2. Restart Claude Desktop
3. Verify server installations
4. Check logs in `~/.config/claude/logs/`

---

**Ready?** Once you complete this setup, I'll have full deployment capabilities!