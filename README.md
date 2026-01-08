# Coolify MCP Server

A Model Context Protocol (MCP) server for the [Coolify](https://coolify.io) API. Manage your self-hosted PaaS infrastructure through AI assistants like Claude.

## Features

**75+ tools** covering the complete Coolify API:

- **Applications** - Deploy from Git repos, Dockerfiles, Docker images, or Docker Compose
- **Databases** - PostgreSQL, MySQL, MariaDB, MongoDB, Redis, ClickHouse, DragonFly, KeyDB
- **Services** - Template-based services or custom Docker Compose stacks
- **Servers** - Manage and validate your infrastructure
- **Projects & Environments** - Organize your resources
- **Deployments** - Deploy by UUID, tag, or PR preview
- **Environment Variables** - Full CRUD with bulk operations

## Prerequisites

- Node.js 18+
- A running Coolify instance
- Coolify API token

## Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/coolify-mcp.git
cd coolify-mcp

# Install dependencies
npm install

# Build
npm run build
```

## Getting a Coolify API Token

1. Log into your Coolify dashboard
2. Go to **Keys & Tokens** > **API tokens**
3. Click **Create New Token**
4. Copy the token (only shown once)

## Usage

### Claude Code CLI

Add the MCP server using the `claude` CLI:

```bash
claude mcp add coolify \
  --transport stdio \
  -e COOLIFY_API_TOKEN="your-api-token" \
  -e COOLIFY_BASE_URL="http://your-coolify-instance:8000" \
  -- node /path/to/coolify-mcp/dist/index.js
```

**Scope options:**

| Flag | Description |
|------|-------------|
| *(default)* | Local to current directory |
| `--scope user` | Available across all your projects |
| `--scope project` | Shared with team via `.mcp.json` |

**Manage the server:**

```bash
# List configured servers
claude mcp list

# Check server details
claude mcp get coolify

# Remove server
claude mcp remove coolify
```

### Claude Desktop

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "coolify": {
      "command": "node",
      "args": ["/path/to/coolify-mcp/dist/index.js"],
      "env": {
        "COOLIFY_API_TOKEN": "your-api-token",
        "COOLIFY_BASE_URL": "http://your-coolify-instance:8000"
      }
    }
  }
}
```

### Manual / Environment Variables

```bash
export COOLIFY_API_TOKEN="your-api-token"
export COOLIFY_BASE_URL="http://your-coolify-instance:8000"
node /path/to/coolify-mcp/dist/index.js
```

## Available Tools

### System
| Tool | Description |
|------|-------------|
| `coolify_health` | Check instance health |
| `coolify_version` | Get Coolify version |
| `coolify_enable_api` | Enable the API |

### Teams
| Tool | Description |
|------|-------------|
| `coolify_list_teams` | List all teams |
| `coolify_get_current_team` | Get current team |
| `coolify_get_team_members` | Get team members |

### Projects
| Tool | Description |
|------|-------------|
| `coolify_list_projects` | List all projects |
| `coolify_get_project` | Get project by UUID |
| `coolify_create_project` | Create new project |
| `coolify_update_project` | Update project |
| `coolify_delete_project` | Delete project |

### Environments
| Tool | Description |
|------|-------------|
| `coolify_get_project_environment` | Get environment |
| `coolify_create_environment` | Create environment |
| `coolify_delete_environment` | Delete environment |

### Servers
| Tool | Description |
|------|-------------|
| `coolify_list_servers` | List all servers |
| `coolify_get_server` | Get server by UUID |
| `coolify_create_server` | Add new server |
| `coolify_update_server` | Update server |
| `coolify_delete_server` | Delete server |
| `coolify_validate_server` | Validate connectivity |
| `coolify_get_server_resources` | Get deployed resources |
| `coolify_get_server_domains` | Get domain mappings |

### Private Keys
| Tool | Description |
|------|-------------|
| `coolify_list_private_keys` | List SSH keys |
| `coolify_get_private_key` | Get key by UUID |
| `coolify_create_private_key` | Create SSH key |
| `coolify_update_private_key` | Update key |
| `coolify_delete_private_key` | Delete key |

### Applications
| Tool | Description |
|------|-------------|
| `coolify_list_applications` | List all applications |
| `coolify_get_application` | Get application by UUID |
| `coolify_create_application_public` | Create from public Git repo |
| `coolify_create_application_private_github` | Create from GitHub (App auth) |
| `coolify_create_application_private_deploy_key` | Create from private repo (SSH) |
| `coolify_create_application_dockerfile` | Create from Dockerfile |
| `coolify_create_application_docker_image` | Create from Docker image |
| `coolify_create_application_docker_compose` | Create from Docker Compose |
| `coolify_update_application` | Update application |
| `coolify_delete_application` | Delete application |
| `coolify_start_application` | Start/deploy application |
| `coolify_stop_application` | Stop application |
| `coolify_restart_application` | Restart application |
| `coolify_get_application_logs` | Get logs |

### Application Environment Variables
| Tool | Description |
|------|-------------|
| `coolify_list_application_envs` | List env vars |
| `coolify_create_application_env` | Create env var |
| `coolify_update_application_env` | Update env var |
| `coolify_delete_application_env` | Delete env var |
| `coolify_bulk_update_application_envs` | Bulk update |

### Databases
| Tool | Description |
|------|-------------|
| `coolify_list_databases` | List all databases |
| `coolify_get_database` | Get database by UUID |
| `coolify_create_database_postgresql` | Create PostgreSQL |
| `coolify_create_database_mysql` | Create MySQL |
| `coolify_create_database_mariadb` | Create MariaDB |
| `coolify_create_database_mongodb` | Create MongoDB |
| `coolify_create_database_redis` | Create Redis |
| `coolify_create_database_clickhouse` | Create ClickHouse |
| `coolify_create_database_dragonfly` | Create DragonFly |
| `coolify_create_database_keydb` | Create KeyDB |
| `coolify_update_database` | Update database |
| `coolify_delete_database` | Delete database |
| `coolify_start_database` | Start database |
| `coolify_stop_database` | Stop database |
| `coolify_restart_database` | Restart database |

### Services
| Tool | Description |
|------|-------------|
| `coolify_list_services` | List all services |
| `coolify_get_service` | Get service by UUID |
| `coolify_create_service` | Create service |
| `coolify_update_service` | Update service |
| `coolify_delete_service` | Delete service |
| `coolify_start_service` | Start service |
| `coolify_stop_service` | Stop service |
| `coolify_restart_service` | Restart service |

### Service Environment Variables
| Tool | Description |
|------|-------------|
| `coolify_list_service_envs` | List env vars |
| `coolify_create_service_env` | Create env var |
| `coolify_update_service_env` | Update env var |
| `coolify_delete_service_env` | Delete env var |

### Deployments
| Tool | Description |
|------|-------------|
| `coolify_deploy` | Deploy by UUID or tag |
| `coolify_list_deployments` | List deployments |
| `coolify_get_deployment` | Get deployment details |

### Resources
| Tool | Description |
|------|-------------|
| `coolify_list_resources` | List all resources |

## Example Prompts

Once configured, use natural language:

```
"List all my applications"

"Create a PostgreSQL database called 'myapp-db' in the production environment"

"Deploy application abc-123 with a force rebuild"

"Show me the last 100 lines of logs for my-api"

"Add DATABASE_URL environment variable to my-app"

"Stop all services in the staging project"

"What servers do I have and what's running on them?"
```

## Development

```bash
npm install      # Install dependencies
npm run dev      # Run in development mode
npm run build    # Build for production
npm run watch    # Watch mode
```

## Security

- Keep API tokens secure and never commit them to version control
- Use environment variables for sensitive configuration
- Create tokens with minimal required permissions
- The `can_read_sensitive` permission controls access to passwords and API keys

## License

MIT

## Links

- [Coolify](https://coolify.io) - Self-hosting with superpowers
- [Coolify API Docs](https://coolify.io/docs/api-reference/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
