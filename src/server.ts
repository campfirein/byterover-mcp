import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { ByteroverService } from "./byterover.js";
import express, { Request, Response } from "express";
import { IncomingMessage, ServerResponse } from "http";
import { z } from "zod";
export const Logger = {
  log: (...args: any[]) => {},
  error: (...args: any[]) => {},
};

export class ByteroverServer {
  private readonly server: McpServer;
  private readonly byteroverService: ByteroverService;
  private sseTransport: SSEServerTransport | null = null;

  constructor(byteroverPublicApiKey: string, userId: string, provider: string, model: string) {
    this.byteroverService = new ByteroverService(byteroverPublicApiKey, userId, provider, model);
    this.server = new McpServer(
      {
        name: "Byterover MCP Server",
        version: "0.1.0",
      },
      {
        capabilities: {
          logging: {},
          tools: {},
        },
      },
    );
    this.registerTools();
  }

  private registerTools(): void {
    // Tool to search the memories
    this.server.tool(
      "search-memories",
      "Search for the relevant memories",
      {
        query: z.string(),
        limit: z.number().optional(),
      },
      async ({ query, limit }) => {
        try {
          Logger.log(`Searching for memories with query: ${query} and limit: ${limit}`);
          const memories = await this.byteroverService.searchMemories(query, limit);
          return {
            content: memories.results.map((result) => ({
              type: "text",
              text: `Memory (score: ${result.score}): ${result.memory}${result.tags ? `\nTags: ${result.tags.join(", ")}` : ""}`,
            })),
          };
        } catch (error) {
          Logger.error(`Error searching for memories: ${error}`);
          return {
            content: [
              {
                type: "text",
                text: "Failed to search for memories",
              },
            ],
          };
        }
      },
    );

    // Tool to create memories
    this.server.tool(
      "create-memory",
      "Create a new memory from messages",
      {
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          }),
        ),
      },
      async ({ messages }) => {
        try {
          Logger.log(`Creating memory with ${messages.length} messages`);
          await this.byteroverService.createMemory(messages);
          return {
            content: [
              {
                type: "text",
                text: "Memory created successfully",
              },
            ],
          };
        } catch (error) {
          Logger.error(`Error creating memory: ${error}`);
          return {
            content: [
              {
                type: "text",
                text: "Failed to create memory",
              },
            ],
          };
        }
      },
    );
  }
  async connect(transport: Transport): Promise<void> {
    await this.server.connect(transport);

    Logger.log = (...args: any[]) => {
      this.server.server.sendLoggingMessage({
        level: "info",
        data: args,
      });
    };
    Logger.error = (...args: any[]) => {
      this.server.server.sendLoggingMessage({
        level: "error",
        data: args,
      });
    };

    Logger.log("Server connected and ready to process requests");
  }

  async startHttpServer(port: number): Promise<void> {
    const app = express();

    app.get("/sse", async (req: Request, res: Response) => {
      console.log("New SSE connection established");
      this.sseTransport = new SSEServerTransport(
        "/messages",
        res as unknown as ServerResponse<IncomingMessage>,
      );
      await this.server.connect(this.sseTransport);
    });

    app.post("/messages", async (req: Request, res: Response) => {
      if (!this.sseTransport) {
        res.sendStatus(400);
        return;
      }
      await this.sseTransport.handlePostMessage(
        req as unknown as IncomingMessage,
        res as unknown as ServerResponse<IncomingMessage>,
      );
    });

    Logger.log = console.log;
    Logger.error = console.error;

    app.listen(port, () => {
      Logger.log(`HTTP server listening on port ${port}`);
      Logger.log(`SSE endpoint available at http://localhost:${port}/sse`);
      Logger.log(`Message endpoint available at http://localhost:${port}/messages`);
    });
  }
}
