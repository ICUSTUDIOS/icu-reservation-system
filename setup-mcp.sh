#!/bin/bash

echo "🚀 MCP Setup for Claude Deployment Automation"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        CONFIG_DIR="$HOME/.config/claude"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="mac"
        CONFIG_DIR="$HOME/Library/Application Support/Claude"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
        CONFIG_DIR="$APPDATA/Claude"
    else
        echo -e "${RED}Unsupported OS: $OSTYPE${NC}"
        exit 1
    fi
}

# Create directories
setup_directories() {
    echo "📁 Creating configuration directories..."
    mkdir -p "$CONFIG_DIR"
    mkdir -p "$HOME/.config/claude/mcp"
    echo -e "${GREEN}✓ Directories created${NC}"
}

# Install MCP servers
install_servers() {
    echo ""
    echo "📦 Installing MCP servers..."
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}✗ npm is not installed. Please install Node.js first.${NC}"
        exit 1
    fi
    
    echo "Installing GitHub MCP server..."
    npm install -g @modelcontextprotocol/server-github
    
    echo "Installing Git MCP server..."
    npm install -g @modelcontextprotocol/server-git
    
    echo "Installing Filesystem MCP server..."
    npm install -g @modelcontextprotocol/server-filesystem
    
    echo "Installing Supabase MCP server..."
    npm install -g @supabase/mcp-server-supabase
    
    echo -e "${GREEN}✓ MCP servers installed${NC}"
}

# Get tokens from user
get_tokens() {
    echo ""
    echo "🔑 Token Configuration"
    echo "----------------------"
    
    # GitHub Token
    echo ""
    echo "1. GitHub Personal Access Token"
    echo "   Get it from: https://github.com/settings/tokens"
    echo "   Required scopes: repo, workflow"
    read -p "   Enter GitHub token (ghp_...): " GITHUB_TOKEN
    
    # Supabase Token
    echo ""
    echo "2. Supabase Access Token"
    echo "   Get it from: https://app.supabase.com/account/tokens"
    read -p "   Enter Supabase token: " SUPABASE_TOKEN
    
    # Render API Key
    echo ""
    echo "3. Render API Key (Optional - for automated deployment)"
    echo "   Get it from: https://dashboard.render.com/account/api-keys"
    read -p "   Enter Render API key (or press Enter to skip): " RENDER_KEY
}

# Create configuration file
create_config() {
    echo ""
    echo "📝 Creating Claude configuration..."
    
    CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
    
    cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$GITHUB_TOKEN"
      }
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"],
      "cwd": "$(pwd)"
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "$(pwd)"
      ]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "$SUPABASE_TOKEN"
      }
    }
  }
}
EOF
    
    echo -e "${GREEN}✓ Configuration created at: $CONFIG_FILE${NC}"
}

# Create .env.mcp file
create_env_file() {
    echo ""
    echo "📄 Creating environment file..."
    
    cat > .env.mcp << EOF
# MCP Configuration
# Generated on $(date)

# GitHub
GITHUB_TOKEN=$GITHUB_TOKEN
GITHUB_OWNER=relaxshadow
GITHUB_REPO=icu_reservation_system

# Supabase
SUPABASE_TOKEN=$SUPABASE_TOKEN
SUPABASE_PROJECT_ID=jkcsowmshwhpeejwfmph

# Render (if provided)
RENDER_API_KEY=$RENDER_KEY

# Project paths
PROJECT_PATH=$(pwd)
EOF
    
    echo -e "${GREEN}✓ Environment file created: .env.mcp${NC}"
}

# Test configuration
test_setup() {
    echo ""
    echo "🧪 Testing setup..."
    
    # Test npm
    if command -v npm &> /dev/null; then
        echo -e "${GREEN}✓ npm is available${NC}"
    else
        echo -e "${RED}✗ npm not found${NC}"
    fi
    
    # Test GitHub token format
    if [[ $GITHUB_TOKEN == ghp_* ]]; then
        echo -e "${GREEN}✓ GitHub token format looks correct${NC}"
    else
        echo -e "${YELLOW}⚠ GitHub token might be invalid (should start with ghp_)${NC}"
    fi
    
    # Test config file
    if [ -f "$CONFIG_FILE" ]; then
        echo -e "${GREEN}✓ Configuration file created${NC}"
    else
        echo -e "${RED}✗ Configuration file not found${NC}"
    fi
}

# Main execution
main() {
    echo ""
    detect_os
    echo "🖥️  Detected OS: $OS"
    echo "📂 Config directory: $CONFIG_DIR"
    
    setup_directories
    install_servers
    get_tokens
    create_config
    create_env_file
    test_setup
    
    echo ""
    echo "============================================="
    echo -e "${GREEN}✅ MCP Setup Complete!${NC}"
    echo "============================================="
    echo ""
    echo "Next steps:"
    echo "1. Restart Claude Desktop"
    echo "2. Claude will now have access to:"
    echo "   - GitHub (push, create repos, manage)"
    echo "   - Supabase (database operations)"
    echo "   - File system (read/write files)"
    echo "   - Git (version control)"
    if [ ! -z "$RENDER_KEY" ]; then
        echo "   - Render (deployment)"
    fi
    echo ""
    echo "Claude can now deploy your app with commands like:"
    echo "  - Push to GitHub"
    echo "  - Create Render services"
    echo "  - Manage deployments"
    echo ""
    echo -e "${YELLOW}⚠ Security: Keep your .env.mcp file private!${NC}"
}

# Run the setup
main