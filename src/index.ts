#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PostBoltClient } from "./client.js";
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";

const apiKey = process.env.POSTBOLT_API_KEY;

if (!apiKey) {
  console.error(
    "Error: POSTBOLT_API_KEY environment variable is required.\n" +
      "Get your API key at https://postbolt.dev and set it in your MCP client config."
  );
  process.exit(1);
}

const server = new McpServer({
  name: "PostBolt",
  version: "1.0.0",
});

const client = new PostBoltClient(apiKey);

registerResources(server, client);
registerTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
