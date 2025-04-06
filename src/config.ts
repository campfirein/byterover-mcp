import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface ServerConfig {
  byteroverPublicApiKey: string;
  port: number;
  userId: string;
  llmKeyName: string;
  model: string;
  configSources: {
    byteroverPublicApiKey: "cli" | "env";
    port: "cli" | "env" | "default";
    userId: "cli" | "env";
    llmKeyName: "cli" | "env";
    model: "cli" | "env";
  };
}

function maskApiKey(key: string): string {
  if (key.length <= 4) return "****";
  return `****${key.slice(-4)}`;
}

interface CliArgs {
  byteroverPublicApiKey?: string;
  port?: number;
  userId?: string;
  llmKeyName?: string;
  model?: string;
}

export function getServerConfig(isStdioMode: boolean): ServerConfig {
  const argv = yargs(hideBin(process.argv))
    .options({
      byteroverPublicApiKey: {
        type: "string",
        description: "Byterover public API key",
      },
      port: {
        type: "number",
        description: "Port to run the server on",
      },
      userId: {
        type: "string",
        description: "User ID to run the server on",
      },
      llmKeyName: {
        type: "string",
        description: "LLM Key Name to use for the server",
      },
      model: {
        type: "string",
        description:
          "LLM Model to use for the server please refer to the provider documentation for the valid models",
      },
    })
    .help()
    .version("0.1.0")
    .parseSync() as CliArgs;

  const config: ServerConfig = {
    byteroverPublicApiKey: argv.byteroverPublicApiKey || "",
    port: argv.port || 3333,
    userId: argv.userId || "",
    llmKeyName: argv.llmKeyName || "",
    model: argv.model || "",
    configSources: {
      byteroverPublicApiKey: argv.byteroverPublicApiKey ? "cli" : "env",
      port: argv.port ? "cli" : process.env.PORT ? "env" : "default",
      userId: argv.userId ? "cli" : "env",
      llmKeyName: argv.llmKeyName ? "cli" : "env",
      model: argv.model ? "cli" : "env",
    },
  };
  // Validate configuration
  if (!config.byteroverPublicApiKey) {
    console.error("Byterover public API key is required");
    process.exit(1);
  }

  if (!config.userId) {
    console.error("User ID is required");
    process.exit(1);
  }

  if (!config.llmKeyName) {
    console.error("LLM Key Name is required");
    process.exit(1);
  }

  if (!config.model) {
    console.error("LLM Model is required");
    process.exit(1);
  }

  // Log configuration sources
  if (!isStdioMode) {
    console.log("\nConfiguration:");
    console.log(`  Byterover Public API Key: ${maskApiKey(config.byteroverPublicApiKey)}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  User ID: ${config.userId}`);
    console.log(`  LLM Key Name: ${config.llmKeyName}`);
    console.log(`  Model: ${config.model}`);
  }
  return config;
}
