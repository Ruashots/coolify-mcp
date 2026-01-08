#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default installation directory
INSTALL_DIR="${HOME}/.local/share/coolify-mcp"
CLAUDE_SETTINGS="${HOME}/.claude.json"

print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║       Coolify MCP Server Installer    ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

check_dependencies() {
    print_info "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git first."
        exit 1
    fi

    print_success "All dependencies found"
}

clone_or_update_repo() {
    if [ -d "$INSTALL_DIR" ]; then
        print_info "Updating existing installation..."
        cd "$INSTALL_DIR"
        git pull origin master
    else
        print_info "Cloning repository..."
        git clone https://github.com/Ruashots/coolify-mcp.git "$INSTALL_DIR"
        cd "$INSTALL_DIR"
    fi
    print_success "Repository ready"
}

install_and_build() {
    print_info "Installing dependencies..."
    npm install --silent

    print_info "Building..."
    npm run build --silent

    print_success "Build complete"
}

configure_credentials() {
    echo ""
    echo -e "${BLUE}Configuration${NC}"
    echo "─────────────────────────────────────────"

    # Get existing values if reconfiguring
    local existing_url=""
    local existing_token=""

    if [ -f "$CLAUDE_SETTINGS" ]; then
        existing_url=$(jq -r '.mcpServers.coolify.env.COOLIFY_BASE_URL // empty' "$CLAUDE_SETTINGS" 2>/dev/null || true)
        existing_token=$(jq -r '.mcpServers.coolify.env.COOLIFY_API_TOKEN // empty' "$CLAUDE_SETTINGS" 2>/dev/null || true)
    fi

    # Prompt for Coolify URL
    if [ -n "$existing_url" ]; then
        read -p "Coolify URL [$existing_url]: " COOLIFY_URL
        COOLIFY_URL="${COOLIFY_URL:-$existing_url}"
    else
        read -p "Coolify URL (e.g., http://192.168.1.100:8000): " COOLIFY_URL
    fi

    if [ -z "$COOLIFY_URL" ]; then
        print_error "Coolify URL is required"
        exit 1
    fi

    # Prompt for API token
    if [ -n "$existing_token" ]; then
        read -p "API Token [keep existing]: " COOLIFY_TOKEN
        COOLIFY_TOKEN="${COOLIFY_TOKEN:-$existing_token}"
    else
        read -p "API Token (from Coolify > Keys & Tokens > API tokens): " COOLIFY_TOKEN
    fi

    if [ -z "$COOLIFY_TOKEN" ]; then
        print_error "API Token is required"
        exit 1
    fi

    print_success "Configuration saved"
}

update_claude_settings() {
    print_info "Configuring Claude Code..."

    # Create settings file if it doesn't exist
    if [ ! -f "$CLAUDE_SETTINGS" ]; then
        echo '{}' > "$CLAUDE_SETTINGS"
    fi

    # Check if jq is available
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install jq and run again, or manually configure Claude Code."
        echo ""
        echo "Manual configuration - add to $CLAUDE_SETTINGS:"
        echo ""
        cat << EOF
{
  "mcpServers": {
    "coolify": {
      "command": "node",
      "args": ["$INSTALL_DIR/dist/index.js"],
      "env": {
        "COOLIFY_BASE_URL": "$COOLIFY_URL",
        "COOLIFY_API_TOKEN": "$COOLIFY_TOKEN"
      }
    }
  }
}
EOF
        exit 1
    fi

    # Update settings using jq
    local tmp_file=$(mktemp)
    jq --arg dir "$INSTALL_DIR" \
       --arg url "$COOLIFY_URL" \
       --arg token "$COOLIFY_TOKEN" \
       '.mcpServers.coolify = {
          "command": "node",
          "args": [($dir + "/dist/index.js")],
          "env": {
            "COOLIFY_BASE_URL": $url,
            "COOLIFY_API_TOKEN": $token
          }
        }' "$CLAUDE_SETTINGS" > "$tmp_file" && mv "$tmp_file" "$CLAUDE_SETTINGS"

    print_success "Claude Code configured"
}

test_connection() {
    print_info "Testing connection to Coolify..."

    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $COOLIFY_TOKEN" \
        "$COOLIFY_URL/api/v1/health" 2>/dev/null || echo "000")

    if [ "$response" = "200" ]; then
        print_success "Connection successful"
    else
        print_error "Connection failed (HTTP $response). Please check your URL and token."
        echo "  You can reconfigure later with: install.sh --reconfigure"
    fi
}

print_completion() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}  Installation Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Restart Claude Code"
    echo "  2. Run /mcp to verify the coolify server is connected"
    echo "  3. Try: 'list my coolify projects'"
    echo ""
    echo "Commands:"
    echo "  Reconfigure:  $0 --reconfigure"
    echo "  Uninstall:    rm -rf $INSTALL_DIR"
    echo ""
}

show_help() {
    echo "Coolify MCP Server Installer"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h        Show this help message"
    echo "  --reconfigure     Reconfigure credentials only (skip install)"
    echo "  --uninstall       Remove the installation"
    echo ""
}

uninstall() {
    print_info "Uninstalling Coolify MCP Server..."

    # Remove installation directory
    if [ -d "$INSTALL_DIR" ]; then
        rm -rf "$INSTALL_DIR"
        print_success "Removed $INSTALL_DIR"
    fi

    # Remove from Claude settings
    if [ -f "$CLAUDE_SETTINGS" ] && command -v jq &> /dev/null; then
        local tmp_file=$(mktemp)
        jq 'del(.mcpServers.coolify)' "$CLAUDE_SETTINGS" > "$tmp_file" && mv "$tmp_file" "$CLAUDE_SETTINGS"
        print_success "Removed from Claude Code settings"
    fi

    echo ""
    print_success "Uninstallation complete. Restart Claude Code."
}

# Main script
main() {
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --reconfigure)
            print_banner
            INSTALL_DIR="${HOME}/.local/share/coolify-mcp"
            configure_credentials
            update_claude_settings
            test_connection
            echo ""
            print_success "Reconfiguration complete. Restart Claude Code."
            exit 0
            ;;
        --uninstall)
            uninstall
            exit 0
            ;;
    esac

    print_banner
    check_dependencies
    clone_or_update_repo
    install_and_build
    configure_credentials
    update_claude_settings
    test_connection
    print_completion
}

main "$@"
