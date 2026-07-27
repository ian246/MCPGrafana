import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { analyzeSystemHealth } from "./grafana-apis/loki.js";
import dotenv from "dotenv";

dotenv.config();

// Create the MCP Server
const server = new McpServer({
  name: "Grafana-Analyzer",
  version: "1.0.0"
});

// Register the analyze_system_health tool
server.tool(
  "analyze_system_health",
  "Analyzes logs from Grafana Loki to determine system health, stability score, and recent errors.",
  {
    since: z.string().optional().describe("Time period to analyze (e.g., '10m', '1h', '24h'). Defaults to '1h'.")
  },
  async ({ since }) => {
    try {
      const timePeriod = since || '1h';
      const analysis = await analyzeSystemHealth(timePeriod);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(analysis, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing system health: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

// Start the server via stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Grafana MCP Server running on stdio"); // Using stderr for logs so it doesn't interfere with stdio JSON RPC
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
