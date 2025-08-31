#!/usr/bin/env node

// Custom Render MCP Server
// This provides Render deployment capabilities to Claude

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');

class RenderMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'render-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apiKey = process.env.RENDER_API_KEY;
    this.apiBase = 'https://api.render.com/v1';
    
    this.setupTools();
  }

  setupTools() {
    // List services
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'render_list_services',
          description: 'List all Render services',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'render_create_service',
          description: 'Create a new Render service',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              repo: { type: 'string' },
              branch: { type: 'string' },
              buildCommand: { type: 'string' },
              startCommand: { type: 'string' },
              envVars: { type: 'object' },
            },
            required: ['name', 'repo'],
          },
        },
        {
          name: 'render_deploy',
          description: 'Trigger a deployment',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: { type: 'string' },
            },
            required: ['serviceId'],
          },
        },
        {
          name: 'render_update_env',
          description: 'Update environment variables',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: { type: 'string' },
              envVars: { type: 'object' },
            },
            required: ['serviceId', 'envVars'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'render_list_services':
            return await this.listServices();
          
          case 'render_create_service':
            return await this.createService(args);
          
          case 'render_deploy':
            return await this.deployService(args.serviceId);
          
          case 'render_update_env':
            return await this.updateEnvVars(args.serviceId, args.envVars);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async listServices() {
    const response = await axios.get(`${this.apiBase}/services`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  async createService(args) {
    const payload = {
      type: 'web_service',
      name: args.name,
      repo: args.repo,
      branch: args.branch || 'main',
      buildCommand: args.buildCommand || 'npm ci && npm run build',
      startCommand: args.startCommand || 'npm run start',
      envVars: Object.entries(args.envVars || {}).map(([key, value]) => ({
        key,
        value,
      })),
      plan: 'free',
      region: 'oregon',
    };

    const response = await axios.post(`${this.apiBase}/services`, payload, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: `Service created: ${response.data.service.name}\nURL: ${response.data.service.url}`,
        },
      ],
    };
  }

  async deployService(serviceId) {
    const response = await axios.post(
      `${this.apiBase}/services/${serviceId}/deploys`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: `Deployment triggered: ${response.data.deploy.id}`,
        },
      ],
    };
  }

  async updateEnvVars(serviceId, envVars) {
    const payload = {
      envVars: Object.entries(envVars).map(([key, value]) => ({
        key,
        value,
      })),
    };

    const response = await axios.patch(
      `${this.apiBase}/services/${serviceId}/env-vars`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      content: [
        {
          type: 'text',
          text: 'Environment variables updated successfully',
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Render MCP Server running');
  }
}

const server = new RenderMCPServer();
server.run();