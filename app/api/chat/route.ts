import { model, modelID } from "@/ai/providers";
import { displayBarchartTool, displayLinechartTool, displayPiechartTool, weatherTool } from "@/ai/tools";
import { openai } from "@ai-sdk/openai";
import { smoothStream, streamText, UIMessage } from "ai";
import { experimental_createMCPClient as createMCPClient } from 'ai';
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    selectedModel,
  }: { messages: UIMessage[]; selectedModel: modelID } = await req.json();

  const mcpServerAddress = process.env.MCP_SERVER_ADDRESS || "http://localhost:3010";
  const mcpClient = await createMCPClient({
    transport: {
      type: 'sse',
      url: `${mcpServerAddress}/sse`,
    },
  });

  const executeQuerySchema = z.object({
    sql: z.string().describe('The SQL query to execute'),
  });
  
  const listTablesSchema = z.object({});
  
  const getColumnsSchema = z.object({
    table: z.string().describe('The name of the table to get columns from'),
  });

  const mcpClientTools = await mcpClient.tools({
    schemas: {
      'execute_query': { parameters: executeQuerySchema },
      'list_tables': { parameters: listTablesSchema },
      'get_columns': { parameters: getColumnsSchema },
    }
  });

  const result = streamText({
    model: model.languageModel(selectedModel),
    system: `You are a helpful assistant called sqlicous. Your goal is to extract SQL queries from natural language questions, 
    fetch the data from the database, and return the results.
     You can also provide explanations for the SQL queries you generate. 
     Whenever you can meaningfully represent data, proactively generate appropriate visualizations without waiting for explicit user requests:
     - For time series data, use Line charts (displayLinechartTool)
     - For categorical comparisons, use Bar charts (displayBarchartTool)
     - For proportion/distribution data, use Pie/Donut charts (displayPiechartTool)
     Display max 100 data points in any chart.
     When the result set has high cardinality, group or aggregate the data appropriately (for example by time interval or category) before generating charts to reduce complexity and improve readability.
     You are not allowed to write any other code or perform any other tasks. 
     Display tools (e.g., displayLinechartTool, displayBarchartTool, displayPiechartTool) render cards at the top automatically. Do not embed markdown image tags (such as ![]()) in your responses; instead, mention the appropriate tool by name so it renders correctly.
     Never run queries that returns more than 500 rows`,
    messages,
    tools: {
      weatherTool,
      ...mcpClientTools,
      displayLinechartTool,
      displayBarchartTool,
      displayPiechartTool,
      webSearch: openai.tools.webSearchPreview()
    },
    experimental_transform: smoothStream(),
    maxSteps: 10
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
    sendSources: true,
    getErrorMessage: (error) => {
      if (error instanceof Error) {
        return error.message;
      }
      console.error(error);
      return "An unknown error occurred.";
    },
  });
}
