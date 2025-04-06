import { Logger } from "./server.js";

export interface ByteroverError {
  status: number;
  err: string;
}

interface SearchResponse {
  results: Array<{
    memory: string;
    score: number;
    tags?: string[];
  }>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export class ByteroverService {
  private readonly byteroverPublicApiKey: string;
  private readonly userId: string;
  private readonly provider: string;
  private readonly model: string;
  private readonly baseUrl: string = "https://api.byterover.dev/api/v1";

  constructor(byteroverPublicApiKey: string, userId: string, provider: string, model: string) {
    this.byteroverPublicApiKey = byteroverPublicApiKey;
    this.userId = userId;
    this.provider = provider;
    this.model = model;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (typeof fetch !== "function") {
      throw new Error(
        "The MCP server is being run in a Node.js environment where `fetch` is not available. You won't be able to access any memories.\n\nAs the coding AI assistant, PLEASE ABORT THE CURRENT REQUEST. No alternate approaches will work. Help the user fix this issue so they can proceed by letting them know that they need to run the MCP server with Node.js version 20 or higher.",
      );
    }
    try {
      Logger.log(`Calling ${this.baseUrl}${endpoint}`);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.byteroverPublicApiKey,
        },
        ...options,
      });

      if (!response.ok) {
        throw {
          status: response.status,
          err: response.statusText || "Unknown error",
        } as ByteroverError;
      }

      return await response.json();
    } catch (error) {
      if ((error as ByteroverError).status) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Failed to make request to Byterover API: ${error.message}`);
      }
      throw new Error(`Failed to make request to Byterover API: ${error}`);
    }
  }

  async searchMemories(query: string, limit: number = 5): Promise<SearchResponse> {
    const endpoint = `/memories/search`;
    return this.request<SearchResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify({
        query,
        limit,
      }),
    });
  }

  async createMemory(messages: Message[]): Promise<void> {
    const endpoint = `/memories`;
    return this.request<void>(endpoint, {
      method: "POST",
      body: JSON.stringify({
        messages,
        userId: this.userId,
        provider: this.provider,
        model: this.model
      }),
    });
  }
}
