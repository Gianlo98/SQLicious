# SQLicious

SQLicious is a local AI chatbot and data interface project designed to automatically generate SQL queries and visualize data—no prior SQL or database knowledge required. It connects to a local MySQL database to retrieve and present information conversationally. It also includes a compatible [Claude Desktop](https://claude.ai) MCP server.

## Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/) installed
- A local MySQL server
- An OpenAI API key

### Setup

1. Clone this repository:
   ```bash
   git clone <repo-url>
   cd SQLicious
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file at the root with the following content, customizing it to your setup:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=sqlicious

   OPENAI_API_KEY=your-openai-key
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

   This will start the web UI and the MCP server.

## Claude Desktop Integration

To use this project with Claude Desktop, open Claude settings, go to the **MCP Servers** section, and add the following JSON:

```json
{
  "mcpServers": {
    "sqlicious": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:3010/sse"
      ]
    }
  }
}
```

## Inspector

If you want to inspect the running MCP server directly, use:

```bash
pnpm run mcp:inspector
```

This will launch the inspector UI for debugging your MCP integration.

## Credits

Based on [ai-sdk-sources](https://github.com/vercel-labs/ai-sdk-sources) by Vercel Labs.
