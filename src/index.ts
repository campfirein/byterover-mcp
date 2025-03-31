#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getServerConfig } from "./config.js";
import { ByteroverServer } from "./server.js";

export async function startServer(): Promise<void> {
  const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");
  const config = getServerConfig(isStdioMode);

  const server = new ByteroverServer(
    config.byteroverPublicApiKey,
    config.userId,
    config.provider,
    config.model,
  );

  if (isStdioMode) {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } else {
    console.log("Starting server with config:", config);
    await server.startHttpServer(config.port);
  }
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
