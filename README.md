<div align="center">
  <h1>Byterover MCP Server</h1>
  <h3>Powering Coding Agent Collaboration with Shared Memory</h3>
</div>

<br/>

Give [Cursor](https://cursor.sh/), [Windsurf](https://codeium.com/windsurf), [Cline](https://cline.bot/), and other AI-powered coding agents the shared long term memory so that they can perform the task well together with the relavant context with this [Model Context Protocol](https://modelcontextprotocol.io/introduction) server.

When Cursor has the knowledge about the codebase; experiences in the past about how it has solved the projects's issues with human it's **way** better and cost effective then re-entering the reasoning loop again

<h3><a href="https://www.byterover.dev/docs/get-started">See quickstart instructions →</a></h3>

## How it works

1. Open your IDE's chat (e.g. agent mode in Cursor).
2. Let's Agent know how they gonna use the external memories (cursor rules, etc..)
3. Cursor will retrieve and store the relavant memories while perform the tasks

## Getting Started

Many code editors and other AI clients use a configuration file to manage MCP servers.

The `byterover-mcp` server can be configured by adding the following to your configuration file.

> NOTE: You will need to create the access token to use this server. Instructions on how to create a Byterover API access token can be found [here](https://www.byterover.dev/docs/get-started).

### MacOS / Linux

```json
{
  "mcpServers": {
    "Byterover Memory MCP": {
        "command": "npx",
        "args": [
          "-y",
          "byterover-mcp",
          "--byterover-public-api-key=YOUR-PUBLIC-KEY",
          "--user-id=YOUR-NAME",
          "--llm-key-name=YOUR-LLM-KEY-NAME",
          "--model=YOUR-LLM-MODEL-NAME"
        ]
      }
  }
}
```

### Windows

```json
{
  "mcpServers": {
    "Byterover Memory MCP": {
      "command": "cmd",
      "args": [
          "/c",
          "npx",
          "-y",
          "byterover-mcp",
          "--byterover-public-api-key=YOUR-PUBLIC-KEY",
          "--user-id=YOUR-NAME",
          "--llm-key-name=YOUR-LLM-KEY-NAME",
          "--model=YOUR-LLM-MODEL-NAME"
      ]
    }
  }
}
```

If you need more information about Byterover see the [Byterover docs](https://www.byterover.dev).