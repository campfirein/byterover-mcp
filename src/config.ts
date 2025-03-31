import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface ServerConfig {
  byteroverPublicApiKey: string;
  port: number;
  userId: string;
  provider: string;
  model: string;
  configSources: {
    byteroverPublicApiKey: "cli" | "env";
    port: "cli" | "env" | "default";
    userId: "cli" | "env";
    provider: "cli" | "env";
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
  provider?: string;
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
      provider: {
        type: "string",
        description: "LLM Provider to use for the server the valid values are openai or claude",
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
    provider: argv.provider || "",
    model: argv.model || "",
    configSources: {
      byteroverPublicApiKey: argv.byteroverPublicApiKey ? "cli" : "env",
      port: argv.port ? "cli" : process.env.PORT ? "env" : "default",
      userId: argv.userId ? "cli" : "env",
      provider: argv.provider ? "cli" : "env",
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

  if (!config.provider) {
    console.error("LLM Provider is required");
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
    console.log(`  Provider: ${config.provider}`);
    console.log(`  Model: ${config.model}`);
  }
  return config;
}
