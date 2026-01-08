#!/usr/bin/env node
/**
 * Coolify MCP Server
 * A comprehensive Model Context Protocol server for the Coolify API
 * Provides full CRUD operations for applications, services, databases, servers, projects, and deployments
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// ============================================================================
// Configuration
// ============================================================================

const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL || "http://localhost:8000";
const COOLIFY_API_TOKEN = process.env.COOLIFY_API_TOKEN || "";

// ============================================================================
// API Client
// ============================================================================

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

async function coolifyRequest<T = any>(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<ApiResponse<T>> {
  const url = `${COOLIFY_BASE_URL}/api/v1${endpoint}`;

  try {
    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${COOLIFY_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data: any = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data && typeof data === 'object' && 'message' in data 
        ? String(data.message) 
        : `HTTP ${response.status}: ${response.statusText}`;
      return {
        success: false,
        error: errorMessage,
        status: response.status,
      };
    }

    return { success: true, data: data as T, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// ============================================================================
// Tool Definitions
// ============================================================================

const tools: Tool[] = [
  // -------------------------------------------------------------------------
  // Health & System
  // -------------------------------------------------------------------------
  {
    name: "coolify_health",
    description: "Check the health status of the Coolify instance",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_version",
    description: "Get the current Coolify version",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_enable_api",
    description: "Enable the Coolify API (requires root access)",
    inputSchema: { type: "object", properties: {}, required: [] },
  },

  // -------------------------------------------------------------------------
  // Teams
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_teams",
    description: "List all teams accessible to the authenticated user",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_get_current_team",
    description: "Get the current team for the API token",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_get_team_members",
    description: "Get members of the current team",
    inputSchema: { type: "object", properties: {}, required: [] },
  },

  // -------------------------------------------------------------------------
  // Projects
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_projects",
    description: "List all projects",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_get_project",
    description: "Get a specific project by UUID",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Project UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_create_project",
    description: "Create a new project",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name" },
        description: { type: "string", description: "Project description" },
      },
      required: ["name"],
    },
  },
  {
    name: "coolify_update_project",
    description: "Update an existing project",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Project UUID" },
        name: { type: "string", description: "New project name" },
        description: { type: "string", description: "New project description" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_delete_project",
    description: "Delete a project",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Project UUID" },
      },
      required: ["uuid"],
    },
  },

  // -------------------------------------------------------------------------
  // Environments
  // -------------------------------------------------------------------------
  {
    name: "coolify_get_project_environment",
    description: "Get a specific environment within a project",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        environment_name: { type: "string", description: "Environment name" },
      },
      required: ["project_uuid", "environment_name"],
    },
  },
  {
    name: "coolify_create_environment",
    description: "Create a new environment in a project",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        name: { type: "string", description: "Environment name" },
        description: { type: "string", description: "Environment description" },
      },
      required: ["project_uuid", "name"],
    },
  },
  {
    name: "coolify_delete_environment",
    description: "Delete an environment from a project",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        environment_name: { type: "string", description: "Environment name" },
      },
      required: ["project_uuid", "environment_name"],
    },
  },

  // -------------------------------------------------------------------------
  // Servers
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_servers",
    description: "List all servers",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_get_server",
    description: "Get a specific server by UUID",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Server UUID" },
        include_resources: { type: "boolean", description: "Include deployed resources" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_create_server",
    description: "Create/add a new server",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Server name" },
        description: { type: "string", description: "Server description" },
        ip: { type: "string", description: "Server IP address" },
        port: { type: "number", description: "SSH port (default: 22)" },
        user: { type: "string", description: "SSH user (default: root)" },
        private_key_uuid: { type: "string", description: "UUID of the private key for SSH" },
        is_build_server: { type: "boolean", description: "Use as build server" },
        instant_validate: { type: "boolean", description: "Validate server immediately" },
      },
      required: ["name", "ip", "private_key_uuid"],
    },
  },
  {
    name: "coolify_update_server",
    description: "Update an existing server",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Server UUID" },
        name: { type: "string", description: "Server name" },
        description: { type: "string", description: "Server description" },
        ip: { type: "string", description: "Server IP address" },
        port: { type: "number", description: "SSH port" },
        user: { type: "string", description: "SSH user" },
        private_key_uuid: { type: "string", description: "Private key UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_delete_server",
    description: "Delete a server",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Server UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_validate_server",
    description: "Validate server connectivity and Docker prerequisites",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Server UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_get_server_resources",
    description: "Get all resources (apps, databases, services) on a server",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Server UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_get_server_domains",
    description: "Get all domain-to-IP mappings for a server",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Server UUID" },
      },
      required: ["uuid"],
    },
  },

  // -------------------------------------------------------------------------
  // GitHub Apps (Sources)
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_github_apps",
    description: "List all GitHub Apps configured in Coolify (needed to get github_app_uuid for private repo deployments)",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_list_github_app_repositories",
    description: "List all repositories accessible by a GitHub App. Use the numeric 'id' from coolify_list_github_apps, not the uuid.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "GitHub App numeric ID (from coolify_list_github_apps response)" },
      },
      required: ["id"],
    },
  },

  // -------------------------------------------------------------------------
  // Private Keys (Security)
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_private_keys",
    description: "List all private SSH keys",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_get_private_key",
    description: "Get a specific private key by UUID",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Private key UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_create_private_key",
    description: "Create a new private SSH key",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Key name" },
        description: { type: "string", description: "Key description" },
        private_key: { type: "string", description: "The private key content" },
      },
      required: ["name", "private_key"],
    },
  },
  {
    name: "coolify_update_private_key",
    description: "Update a private key",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Private key UUID" },
        name: { type: "string", description: "Key name" },
        description: { type: "string", description: "Key description" },
        private_key: { type: "string", description: "The private key content" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_delete_private_key",
    description: "Delete a private key",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Private key UUID" },
      },
      required: ["uuid"],
    },
  },

  // -------------------------------------------------------------------------
  // Applications
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_applications",
    description: "List all applications",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_get_application",
    description: "Get a specific application by UUID",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_create_application_public",
    description: "Create an application from a public Git repository",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        git_repository: { type: "string", description: "Git repository URL" },
        git_branch: { type: "string", description: "Git branch" },
        build_pack: {
          type: "string",
          enum: ["nixpacks", "static", "dockerfile", "dockercompose"],
          description: "Build pack to use",
        },
        ports_exposes: { type: "string", description: "Ports to expose (e.g., '3000' or '3000,8080')" },
        name: { type: "string", description: "Application name" },
        description: { type: "string", description: "Application description" },
        domains: { type: "string", description: "Custom domains (comma-separated)" },
        instant_deploy: { type: "boolean", description: "Deploy immediately after creation" },
        destination_uuid: { type: "string", description: "Destination UUID (if server has multiple)" },
      },
      required: ["project_uuid", "server_uuid", "environment_name", "git_repository", "git_branch", "build_pack", "ports_exposes"],
    },
  },
  {
    name: "coolify_create_application_private_github",
    description: "Create an application from a private GitHub repository using GitHub App",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        github_app_uuid: { type: "string", description: "GitHub App UUID" },
        git_repository: { type: "string", description: "Git repository URL" },
        git_branch: { type: "string", description: "Git branch" },
        build_pack: { type: "string", description: "Build pack to use" },
        ports_exposes: { type: "string", description: "Ports to expose" },
        name: { type: "string", description: "Application name" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name", "github_app_uuid", "git_repository", "git_branch", "build_pack", "ports_exposes"],
    },
  },
  {
    name: "coolify_create_application_private_deploy_key",
    description: "Create an application from a private repository using SSH deploy key",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        private_key_uuid: { type: "string", description: "SSH private key UUID" },
        git_repository: { type: "string", description: "Git repository URL (SSH format)" },
        git_branch: { type: "string", description: "Git branch" },
        build_pack: { type: "string", description: "Build pack to use" },
        ports_exposes: { type: "string", description: "Ports to expose" },
        name: { type: "string", description: "Application name" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name", "private_key_uuid", "git_repository", "git_branch", "build_pack", "ports_exposes"],
    },
  },
  {
    name: "coolify_create_application_dockerfile",
    description: "Create an application from a Dockerfile",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        git_repository: { type: "string", description: "Git repository URL" },
        git_branch: { type: "string", description: "Git branch" },
        dockerfile: { type: "string", description: "Dockerfile content (base64 encoded)" },
        ports_exposes: { type: "string", description: "Ports to expose" },
        name: { type: "string", description: "Application name" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name", "ports_exposes"],
    },
  },
  {
    name: "coolify_create_application_docker_image",
    description: "Create an application from a Docker image",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        docker_registry_image_name: { type: "string", description: "Docker image name (e.g., nginx:alpine)" },
        docker_registry_image_tag: { type: "string", description: "Image tag (default: latest)" },
        ports_exposes: { type: "string", description: "Ports to expose" },
        name: { type: "string", description: "Application name" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name", "docker_registry_image_name", "ports_exposes"],
    },
  },
  {
    name: "coolify_create_application_docker_compose",
    description: "Create an application from Docker Compose",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        docker_compose_raw: { type: "string", description: "Docker Compose content (base64 encoded)" },
        name: { type: "string", description: "Application name" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name", "docker_compose_raw"],
    },
  },
  {
    name: "coolify_update_application",
    description: "Update an existing application",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
        name: { type: "string", description: "Application name" },
        description: { type: "string", description: "Application description" },
        domains: { type: "string", description: "Custom domains" },
        git_repository: { type: "string", description: "Git repository URL" },
        git_branch: { type: "string", description: "Git branch" },
        git_commit_sha: { type: "string", description: "Specific commit SHA" },
        build_pack: { type: "string", description: "Build pack" },
        ports_exposes: { type: "string", description: "Exposed ports" },
        ports_mappings: { type: "string", description: "Port mappings" },
        install_command: { type: "string", description: "Install command" },
        build_command: { type: "string", description: "Build command" },
        start_command: { type: "string", description: "Start command" },
        base_directory: { type: "string", description: "Base directory" },
        publish_directory: { type: "string", description: "Publish directory" },
        health_check_enabled: { type: "boolean", description: "Enable health checks" },
        health_check_path: { type: "string", description: "Health check path" },
        health_check_interval: { type: "number", description: "Health check interval (seconds)" },
        limits_memory: { type: "string", description: "Memory limit (e.g., 512m)" },
        limits_cpus: { type: "string", description: "CPU limit" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_delete_application",
    description: "Delete an application",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
        delete_configurations: { type: "boolean", description: "Delete configuration files" },
        delete_volumes: { type: "boolean", description: "Delete associated volumes" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_start_application",
    description: "Start/deploy an application",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
        force: { type: "boolean", description: "Force rebuild without cache" },
        commit: { type: "string", description: "Specific commit SHA to deploy" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_stop_application",
    description: "Stop an application",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_restart_application",
    description: "Restart an application",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_get_application_logs",
    description: "Get application logs",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
        tail: { type: "number", description: "Number of lines to retrieve (default: 1000)" },
        since: { type: "string", description: "Show logs since timestamp (ISO 8601)" },
      },
      required: ["uuid"],
    },
  },

  // -------------------------------------------------------------------------
  // Application Environment Variables
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_application_envs",
    description: "List environment variables for an application",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_create_application_env",
    description: "Create an environment variable for an application",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
        key: { type: "string", description: "Variable name" },
        value: { type: "string", description: "Variable value" },
        is_buildtime: { type: "boolean", description: "Available during build" },
        is_runtime: { type: "boolean", description: "Available at runtime" },
        is_preview: { type: "boolean", description: "Apply to preview deployments" },
      },
      required: ["uuid", "key", "value"],
    },
  },
  {
    name: "coolify_update_application_env",
    description: "Update an environment variable",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
        env_uuid: { type: "string", description: "Environment variable UUID" },
        key: { type: "string", description: "Variable name" },
        value: { type: "string", description: "Variable value" },
        is_buildtime: { type: "boolean", description: "Available during build" },
        is_runtime: { type: "boolean", description: "Available at runtime" },
        is_preview: { type: "boolean", description: "Apply to preview deployments" },
      },
      required: ["uuid", "env_uuid"],
    },
  },
  {
    name: "coolify_delete_application_env",
    description: "Delete an environment variable",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
        env_uuid: { type: "string", description: "Environment variable UUID" },
      },
      required: ["uuid", "env_uuid"],
    },
  },
  {
    name: "coolify_bulk_update_application_envs",
    description: "Bulk create/update environment variables for an application",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
        variables: {
          type: "array",
          description: "Array of environment variables",
          items: {
            type: "object",
            properties: {
              key: { type: "string" },
              value: { type: "string" },
              is_buildtime: { type: "boolean" },
              is_runtime: { type: "boolean" },
              is_preview: { type: "boolean" },
            },
            required: ["key", "value"],
          },
        },
      },
      required: ["uuid", "variables"],
    },
  },

  // -------------------------------------------------------------------------
  // Databases
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_databases",
    description: "List all databases",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_get_database",
    description: "Get a specific database by UUID",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Database UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_create_database_postgresql",
    description: "Create a PostgreSQL database",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        name: { type: "string", description: "Database name" },
        description: { type: "string", description: "Description" },
        image: { type: "string", description: "Docker image (default: postgres:16-alpine)" },
        postgres_user: { type: "string", description: "PostgreSQL user" },
        postgres_password: { type: "string", description: "PostgreSQL password" },
        postgres_db: { type: "string", description: "Database name" },
        public_port: { type: "number", description: "Public port to expose" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
        limits_memory: { type: "string", description: "Memory limit" },
      },
      required: ["project_uuid", "server_uuid", "environment_name"],
    },
  },
  {
    name: "coolify_create_database_mysql",
    description: "Create a MySQL database",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        name: { type: "string", description: "Database name" },
        image: { type: "string", description: "Docker image (default: mysql:8.0)" },
        mysql_user: { type: "string", description: "MySQL user" },
        mysql_password: { type: "string", description: "MySQL password" },
        mysql_database: { type: "string", description: "Database name" },
        mysql_root_password: { type: "string", description: "Root password" },
        public_port: { type: "number", description: "Public port" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name"],
    },
  },
  {
    name: "coolify_create_database_mariadb",
    description: "Create a MariaDB database",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        name: { type: "string", description: "Database name" },
        image: { type: "string", description: "Docker image (default: mariadb:11)" },
        mariadb_user: { type: "string", description: "MariaDB user" },
        mariadb_password: { type: "string", description: "MariaDB password" },
        mariadb_database: { type: "string", description: "Database name" },
        mariadb_root_password: { type: "string", description: "Root password" },
        public_port: { type: "number", description: "Public port" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name"],
    },
  },
  {
    name: "coolify_create_database_mongodb",
    description: "Create a MongoDB database",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        name: { type: "string", description: "Database name" },
        image: { type: "string", description: "Docker image (default: mongo:7)" },
        mongo_initdb_root_username: { type: "string", description: "Root username" },
        mongo_initdb_root_password: { type: "string", description: "Root password" },
        mongo_initdb_database: { type: "string", description: "Initial database" },
        public_port: { type: "number", description: "Public port" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name"],
    },
  },
  {
    name: "coolify_create_database_redis",
    description: "Create a Redis database",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        name: { type: "string", description: "Database name" },
        image: { type: "string", description: "Docker image (default: redis:7-alpine)" },
        redis_password: { type: "string", description: "Redis password" },
        redis_conf: { type: "string", description: "Custom redis.conf content" },
        public_port: { type: "number", description: "Public port" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name"],
    },
  },
  {
    name: "coolify_create_database_clickhouse",
    description: "Create a ClickHouse database",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        name: { type: "string", description: "Database name" },
        image: { type: "string", description: "Docker image" },
        clickhouse_admin_user: { type: "string", description: "Admin username" },
        clickhouse_admin_password: { type: "string", description: "Admin password" },
        public_port: { type: "number", description: "Public port" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name"],
    },
  },
  {
    name: "coolify_create_database_dragonfly",
    description: "Create a DragonFly database (Redis-compatible)",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        name: { type: "string", description: "Database name" },
        image: { type: "string", description: "Docker image" },
        dragonfly_password: { type: "string", description: "Password" },
        public_port: { type: "number", description: "Public port" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name"],
    },
  },
  {
    name: "coolify_create_database_keydb",
    description: "Create a KeyDB database (Redis-compatible)",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        name: { type: "string", description: "Database name" },
        image: { type: "string", description: "Docker image" },
        keydb_password: { type: "string", description: "Password" },
        keydb_conf: { type: "string", description: "Custom keydb.conf content" },
        public_port: { type: "number", description: "Public port" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name"],
    },
  },
  {
    name: "coolify_update_database",
    description: "Update a database configuration",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Database UUID" },
        name: { type: "string", description: "Database name" },
        description: { type: "string", description: "Description" },
        image: { type: "string", description: "Docker image" },
        public_port: { type: "number", description: "Public port" },
        limits_memory: { type: "string", description: "Memory limit" },
        limits_cpus: { type: "string", description: "CPU limit" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_delete_database",
    description: "Delete a database",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Database UUID" },
        delete_configurations: { type: "boolean", description: "Delete configuration files" },
        delete_volumes: { type: "boolean", description: "Delete associated volumes" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_start_database",
    description: "Start a database",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Database UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_stop_database",
    description: "Stop a database",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Database UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_restart_database",
    description: "Restart a database",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Database UUID" },
      },
      required: ["uuid"],
    },
  },

  // -------------------------------------------------------------------------
  // Services
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_services",
    description: "List all services",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "coolify_get_service",
    description: "Get a specific service by UUID",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Service UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_create_service",
    description: "Create a new service (from template or docker-compose)",
    inputSchema: {
      type: "object",
      properties: {
        project_uuid: { type: "string", description: "Project UUID" },
        server_uuid: { type: "string", description: "Server UUID" },
        environment_name: { type: "string", description: "Environment name" },
        type: { type: "string", description: "Service type/template name (e.g., 'plausible', 'supabase')" },
        name: { type: "string", description: "Service name" },
        description: { type: "string", description: "Service description" },
        docker_compose_raw: { type: "string", description: "Custom docker-compose content (base64 encoded)" },
        instant_deploy: { type: "boolean", description: "Deploy immediately" },
      },
      required: ["project_uuid", "server_uuid", "environment_name"],
    },
  },
  {
    name: "coolify_update_service",
    description: "Update a service",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Service UUID" },
        name: { type: "string", description: "Service name" },
        description: { type: "string", description: "Description" },
        docker_compose_raw: { type: "string", description: "Docker compose content (base64)" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_delete_service",
    description: "Delete a service",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Service UUID" },
        delete_configurations: { type: "boolean", description: "Delete configuration files" },
        delete_volumes: { type: "boolean", description: "Delete associated volumes" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_start_service",
    description: "Start a service",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Service UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_stop_service",
    description: "Stop a service",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Service UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_restart_service",
    description: "Restart a service",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Service UUID" },
      },
      required: ["uuid"],
    },
  },

  // -------------------------------------------------------------------------
  // Service Environment Variables
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_service_envs",
    description: "List environment variables for a service",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Service UUID" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_create_service_env",
    description: "Create an environment variable for a service",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Service UUID" },
        key: { type: "string", description: "Variable name" },
        value: { type: "string", description: "Variable value" },
      },
      required: ["uuid", "key", "value"],
    },
  },
  {
    name: "coolify_update_service_env",
    description: "Update a service environment variable",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Service UUID" },
        env_uuid: { type: "string", description: "Environment variable UUID" },
        key: { type: "string", description: "Variable name" },
        value: { type: "string", description: "Variable value" },
      },
      required: ["uuid", "env_uuid"],
    },
  },
  {
    name: "coolify_delete_service_env",
    description: "Delete a service environment variable",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Service UUID" },
        env_uuid: { type: "string", description: "Environment variable UUID" },
      },
      required: ["uuid", "env_uuid"],
    },
  },

  // -------------------------------------------------------------------------
  // Deployments
  // -------------------------------------------------------------------------
  {
    name: "coolify_deploy",
    description: "Deploy resources by UUID or tag",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Resource UUID(s), comma-separated" },
        tag: { type: "string", description: "Tag name(s), comma-separated" },
        force: { type: "boolean", description: "Force rebuild without cache" },
        pr: { type: "number", description: "Pull request ID for preview deployment" },
      },
      required: [],
    },
  },
  {
    name: "coolify_list_deployments",
    description: "List deployments for an application",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Application UUID" },
        skip: { type: "number", description: "Number of records to skip" },
        take: { type: "number", description: "Number of records to take" },
      },
      required: ["uuid"],
    },
  },
  {
    name: "coolify_get_deployment",
    description: "Get a specific deployment by UUID",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Deployment UUID" },
      },
      required: ["uuid"],
    },
  },

  // -------------------------------------------------------------------------
  // Resources (Generic)
  // -------------------------------------------------------------------------
  {
    name: "coolify_list_resources",
    description: "List all resources (applications, databases, services)",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
];

// ============================================================================
// Tool Handlers
// ============================================================================

async function handleToolCall(name: string, args: Record<string, any>): Promise<string> {
  let result: ApiResponse;

  switch (name) {
    // Health & System
    case "coolify_health":
      result = await coolifyRequest("/health");
      break;
    case "coolify_version":
      result = await coolifyRequest("/version");
      break;
    case "coolify_enable_api":
      result = await coolifyRequest("/enable", "GET");
      break;

    // Teams
    case "coolify_list_teams":
      result = await coolifyRequest("/teams");
      break;
    case "coolify_get_current_team":
      result = await coolifyRequest("/teams/current");
      break;
    case "coolify_get_team_members":
      result = await coolifyRequest("/teams/current/members");
      break;

    // Projects
    case "coolify_list_projects":
      result = await coolifyRequest("/projects");
      break;
    case "coolify_get_project":
      result = await coolifyRequest(`/projects/${args.uuid}`);
      break;
    case "coolify_create_project":
      result = await coolifyRequest("/projects", "POST", args);
      break;
    case "coolify_update_project": {
      const { uuid, ...updateData } = args;
      result = await coolifyRequest(`/projects/${uuid}`, "PATCH", updateData);
      break;
    }
    case "coolify_delete_project":
      result = await coolifyRequest(`/projects/${args.uuid}`, "DELETE");
      break;

    // Environments
    case "coolify_get_project_environment":
      result = await coolifyRequest(`/projects/${args.project_uuid}/${args.environment_name}`);
      break;
    case "coolify_create_environment": {
      const { project_uuid, ...envData } = args;
      result = await coolifyRequest(`/projects/${project_uuid}/environments`, "POST", envData);
      break;
    }
    case "coolify_delete_environment":
      result = await coolifyRequest(`/projects/${args.project_uuid}/${args.environment_name}`, "DELETE");
      break;

    // Servers
    case "coolify_list_servers":
      result = await coolifyRequest("/servers");
      break;
    case "coolify_get_server": {
      const { uuid, include_resources } = args;
      const query = include_resources ? "?resources=true" : "";
      result = await coolifyRequest(`/servers/${uuid}${query}`);
      break;
    }
    case "coolify_create_server":
      result = await coolifyRequest("/servers", "POST", args);
      break;
    case "coolify_update_server": {
      const { uuid, ...serverData } = args;
      result = await coolifyRequest(`/servers/${uuid}`, "PATCH", serverData);
      break;
    }
    case "coolify_delete_server":
      result = await coolifyRequest(`/servers/${args.uuid}`, "DELETE");
      break;
    case "coolify_validate_server":
      result = await coolifyRequest(`/servers/${args.uuid}/validate`, "GET");
      break;
    case "coolify_get_server_resources":
      result = await coolifyRequest(`/servers/${args.uuid}/resources`);
      break;
    case "coolify_get_server_domains":
      result = await coolifyRequest(`/servers/${args.uuid}/domains`);
      break;

    // GitHub Apps
    case "coolify_list_github_apps":
      result = await coolifyRequest("/github-apps");
      break;
    case "coolify_list_github_app_repositories":
      result = await coolifyRequest(`/github-apps/${args.id}/repositories`);
      break;

    // Private Keys
    case "coolify_list_private_keys":
      result = await coolifyRequest("/security/keys");
      break;
    case "coolify_get_private_key":
      result = await coolifyRequest(`/security/keys/${args.uuid}`);
      break;
    case "coolify_create_private_key":
      result = await coolifyRequest("/security/keys", "POST", args);
      break;
    case "coolify_update_private_key": {
      const { uuid, ...keyData } = args;
      result = await coolifyRequest(`/security/keys/${uuid}`, "PATCH", keyData);
      break;
    }
    case "coolify_delete_private_key":
      result = await coolifyRequest(`/security/keys/${args.uuid}`, "DELETE");
      break;

    // Applications
    case "coolify_list_applications":
      result = await coolifyRequest("/applications");
      break;
    case "coolify_get_application":
      result = await coolifyRequest(`/applications/${args.uuid}`);
      break;
    case "coolify_create_application_public":
      result = await coolifyRequest("/applications/public", "POST", args);
      break;
    case "coolify_create_application_private_github":
      result = await coolifyRequest("/applications/private-github-app", "POST", args);
      break;
    case "coolify_create_application_private_deploy_key":
      result = await coolifyRequest("/applications/private-deploy-key", "POST", args);
      break;
    case "coolify_create_application_dockerfile":
      result = await coolifyRequest("/applications/dockerfile", "POST", args);
      break;
    case "coolify_create_application_docker_image":
      result = await coolifyRequest("/applications/dockerimage", "POST", args);
      break;
    case "coolify_create_application_docker_compose":
      result = await coolifyRequest("/applications/dockercompose", "POST", args);
      break;
    case "coolify_update_application": {
      const { uuid, ...appData } = args;
      result = await coolifyRequest(`/applications/${uuid}`, "PATCH", appData);
      break;
    }
    case "coolify_delete_application": {
      const { uuid, ...options } = args;
      const query = new URLSearchParams();
      if (options.delete_configurations) query.set("delete_configurations", "true");
      if (options.delete_volumes) query.set("delete_volumes", "true");
      const queryStr = query.toString() ? `?${query.toString()}` : "";
      result = await coolifyRequest(`/applications/${uuid}${queryStr}`, "DELETE");
      break;
    }
    case "coolify_start_application": {
      const { uuid, force, commit } = args;
      const query = new URLSearchParams();
      if (force) query.set("force", "true");
      if (commit) query.set("commit", commit);
      const queryStr = query.toString() ? `?${query.toString()}` : "";
      result = await coolifyRequest(`/applications/${uuid}/start${queryStr}`, "POST");
      break;
    }
    case "coolify_stop_application":
      result = await coolifyRequest(`/applications/${args.uuid}/stop`, "POST");
      break;
    case "coolify_restart_application":
      result = await coolifyRequest(`/applications/${args.uuid}/restart`, "POST");
      break;
    case "coolify_get_application_logs": {
      const { uuid, tail, since } = args;
      const query = new URLSearchParams();
      if (tail) query.set("tail", String(tail));
      if (since) query.set("since", since);
      const queryStr = query.toString() ? `?${query.toString()}` : "";
      result = await coolifyRequest(`/applications/${uuid}/logs${queryStr}`);
      break;
    }

    // Application Environment Variables
    case "coolify_list_application_envs":
      result = await coolifyRequest(`/applications/${args.uuid}/envs`);
      break;
    case "coolify_create_application_env": {
      const { uuid, ...envData } = args;
      result = await coolifyRequest(`/applications/${uuid}/envs`, "POST", envData);
      break;
    }
    case "coolify_update_application_env": {
      const { uuid, env_uuid, ...envData } = args;
      result = await coolifyRequest(`/applications/${uuid}/envs`, "PATCH", { uuid: env_uuid, ...envData });
      break;
    }
    case "coolify_delete_application_env":
      result = await coolifyRequest(`/applications/${args.uuid}/envs/${args.env_uuid}`, "DELETE");
      break;
    case "coolify_bulk_update_application_envs": {
      const { uuid, variables } = args;
      result = await coolifyRequest(`/applications/${uuid}/envs/bulk`, "PATCH", { data: variables });
      break;
    }

    // Databases
    case "coolify_list_databases":
      result = await coolifyRequest("/databases");
      break;
    case "coolify_get_database":
      result = await coolifyRequest(`/databases/${args.uuid}`);
      break;
    case "coolify_create_database_postgresql":
      result = await coolifyRequest("/databases/postgresql", "POST", args);
      break;
    case "coolify_create_database_mysql":
      result = await coolifyRequest("/databases/mysql", "POST", args);
      break;
    case "coolify_create_database_mariadb":
      result = await coolifyRequest("/databases/mariadb", "POST", args);
      break;
    case "coolify_create_database_mongodb":
      result = await coolifyRequest("/databases/mongodb", "POST", args);
      break;
    case "coolify_create_database_redis":
      result = await coolifyRequest("/databases/redis", "POST", args);
      break;
    case "coolify_create_database_clickhouse":
      result = await coolifyRequest("/databases/clickhouse", "POST", args);
      break;
    case "coolify_create_database_dragonfly":
      result = await coolifyRequest("/databases/dragonfly", "POST", args);
      break;
    case "coolify_create_database_keydb":
      result = await coolifyRequest("/databases/keydb", "POST", args);
      break;
    case "coolify_update_database": {
      const { uuid, ...dbData } = args;
      result = await coolifyRequest(`/databases/${uuid}`, "PATCH", dbData);
      break;
    }
    case "coolify_delete_database": {
      const { uuid, ...options } = args;
      const query = new URLSearchParams();
      if (options.delete_configurations) query.set("delete_configurations", "true");
      if (options.delete_volumes) query.set("delete_volumes", "true");
      const queryStr = query.toString() ? `?${query.toString()}` : "";
      result = await coolifyRequest(`/databases/${uuid}${queryStr}`, "DELETE");
      break;
    }
    case "coolify_start_database":
      result = await coolifyRequest(`/databases/${args.uuid}/start`, "POST");
      break;
    case "coolify_stop_database":
      result = await coolifyRequest(`/databases/${args.uuid}/stop`, "POST");
      break;
    case "coolify_restart_database":
      result = await coolifyRequest(`/databases/${args.uuid}/restart`, "POST");
      break;

    // Services
    case "coolify_list_services":
      result = await coolifyRequest("/services");
      break;
    case "coolify_get_service":
      result = await coolifyRequest(`/services/${args.uuid}`);
      break;
    case "coolify_create_service":
      result = await coolifyRequest("/services", "POST", args);
      break;
    case "coolify_update_service": {
      const { uuid, ...serviceData } = args;
      result = await coolifyRequest(`/services/${uuid}`, "PATCH", serviceData);
      break;
    }
    case "coolify_delete_service": {
      const { uuid, ...options } = args;
      const query = new URLSearchParams();
      if (options.delete_configurations) query.set("delete_configurations", "true");
      if (options.delete_volumes) query.set("delete_volumes", "true");
      const queryStr = query.toString() ? `?${query.toString()}` : "";
      result = await coolifyRequest(`/services/${uuid}${queryStr}`, "DELETE");
      break;
    }
    case "coolify_start_service":
      result = await coolifyRequest(`/services/${args.uuid}/start`, "POST");
      break;
    case "coolify_stop_service":
      result = await coolifyRequest(`/services/${args.uuid}/stop`, "POST");
      break;
    case "coolify_restart_service":
      result = await coolifyRequest(`/services/${args.uuid}/restart`, "POST");
      break;

    // Service Environment Variables
    case "coolify_list_service_envs":
      result = await coolifyRequest(`/services/${args.uuid}/envs`);
      break;
    case "coolify_create_service_env": {
      const { uuid, ...envData } = args;
      result = await coolifyRequest(`/services/${uuid}/envs`, "POST", envData);
      break;
    }
    case "coolify_update_service_env": {
      const { uuid, env_uuid, ...envData } = args;
      result = await coolifyRequest(`/services/${uuid}/envs`, "PATCH", { uuid: env_uuid, ...envData });
      break;
    }
    case "coolify_delete_service_env":
      result = await coolifyRequest(`/services/${args.uuid}/envs/${args.env_uuid}`, "DELETE");
      break;

    // Deployments
    case "coolify_deploy": {
      const query = new URLSearchParams();
      if (args.uuid) query.set("uuid", args.uuid);
      if (args.tag) query.set("tag", args.tag);
      if (args.force) query.set("force", "true");
      if (args.pr) query.set("pr", String(args.pr));
      const queryStr = query.toString() ? `?${query.toString()}` : "";
      result = await coolifyRequest(`/deploy${queryStr}`, "GET");
      break;
    }
    case "coolify_list_deployments": {
      const { uuid, skip, take } = args;
      const query = new URLSearchParams();
      if (skip) query.set("skip", String(skip));
      if (take) query.set("take", String(take));
      const queryStr = query.toString() ? `?${query.toString()}` : "";
      result = await coolifyRequest(`/applications/${uuid}/deployments${queryStr}`);
      break;
    }
    case "coolify_get_deployment":
      result = await coolifyRequest(`/deployments/${args.uuid}`);
      break;

    // Resources
    case "coolify_list_resources":
      result = await coolifyRequest("/resources");
      break;

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }

  return JSON.stringify(result, null, 2);
}

// ============================================================================
// Server Setup
// ============================================================================

const server = new Server(
  {
    name: "coolify-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await handleToolCall(name, args || {});
    return {
      content: [{ type: "text", text: result }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: JSON.stringify({ error: errorMessage }) }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Coolify MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
