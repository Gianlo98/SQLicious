import { tool } from "ai";
import { z } from "zod";

export const weatherTool = tool({
  description: "Get the weather in a location",
  parameters: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
  execute: async ({ location }) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10,
  }),
});


export const displayLinechartTool = tool({
  description: `Display a line chart with the given data and optional insights.
  
  WHEN TO USE LINE CHARTS (BEST PRACTICES):
  - Use for showing trends over time or continuous data
  - Ideal for displaying evolution, progression, or changes in values
  - Perfect for time series data where order/sequence matters
  - Good for showing patterns, cycles, or fluctuations
  - Useful for comparing multiple related series over the same time period
  
  WHEN TO USE LINE CHARTS OVER OTHER CHARTS:
  - When time or sequence is a crucial dimension
  - When showing trend direction is more important than individual values
  - When data is continuous rather than categorical
  - When tracking changes or rates of change over time
  - When needing to show multiple series that share the same x-axis scale
  
  ALWAYS ENSURE:
  - Clear x-axis labels (typically time periods)
  - Appropriate scale on y-axis (consider starting at zero unless focusing on small changes)
  - Limited number of lines (3-5 maximum for readability)
  - Distinct colors and patterns for multiple lines
  - Include insights that highlight key trends, turning points, or anomalies`,
  parameters: z.object({
    title: z.string().describe('The title of the chart'),
    data: z.array(z.object({
      date: z.string().describe('The date of the data point'),
      value: z.number().describe('The value of the data point'),
    })).describe('The data points for the chart'),
    insights: z.object({
      trend: z.number().optional().describe('A numerical trend percentage (positive or negative)'),
      description: z.string().optional().describe('A textual description highlighting the most important trends, patterns, or anomalies in the data'),
      icon: z.enum(['trending-up', 'trending-down', 'alert', 'info', 'check', 'x', 'star']).optional()
        .describe('Optional icon to display. If not provided, trend icon will be used automatically'),
    }).optional().describe('Optional AI-generated insights about the data'),
  }),
  execute: async ({ title, data, insights }) => {
    return { title, data, insights };
  },
});

export const displayBarchartTool = tool({
  description: `Display a bar chart with the given data and optional insights.
  
  WHEN TO USE BAR/COLUMN CHARTS (BEST PRACTICES):
  - Use for comparing values across different categories
  - Ideal when precision in comparison is important
  - Excellent for displaying ranking data (highest to lowest)
  - Good for showing a large number of categories (better than pie charts for >7 categories)
  - Useful for displaying negative values
  - Effective when you need to show exact values alongside visual comparison
  
  ADVANTAGES OVER PIE CHARTS:
  - Easier to compare values precisely
  - Can handle more categories without becoming cluttered
  - Better at showing small differences between values
  - Can represent both positive and negative values
  - Allows for multiple series comparisons (grouped or stacked bars)
  
  ALWAYS ENSURE:
  - Categories are clearly labeled
  - Values start at zero to avoid misleading visual comparisons
  - Logical ordering (alphabetical, chronological, or by value)
  - Limited use of colors (avoid rainbow effect unless colors have meaning)
  - Consider horizontal orientation for long category names or many categories`,
  parameters: z.object({
    title: z.string().describe('The title of the chart'),
    data: z.array(z.object({
      category: z.string().describe('The category of the data point'),
      value: z.number().describe('The value of the data point'),
    })).describe('The data points for the chart'),
    insights: z.object({
      trend: z.number().optional().describe('A numerical trend percentage (positive or negative)'),
      description: z.string().optional().describe('A textual description/analysis highlighting key patterns, outliers, or conclusions from the data'),
      icon: z.enum(['trending-up', 'trending-down', 'alert', 'info', 'check', 'x', 'star']).optional()
        .describe('Optional icon to display. If not provided, trend icon will be used automatically'),
    }).optional().describe('Optional AI-generated insights about the data'),
  }),
  execute: async ({ title, data, insights }) => {
    return { title, data, insights };
  },
});

export const displayPiechartTool = tool({
  description: `Display a pie/donut chart with the given data and optional insights.
  
  WHEN TO USE PIE CHARTS (BEST PRACTICES):
  - Use for showing parts of a whole or composition (how different categories make up a total)
  - Best for displaying 2-7 categories/segments; too many segments become difficult to read
  - Ideal when showing proportions is more important than exact values
  - Perfect for data where categories sum to a meaningful total (100%)
  - Good for showing high-level distributions at a glance
  
  AVOID PIE CHARTS WHEN:
  - You have more than 7 segments (consider a bar chart instead)
  - You need to compare precise values (bar charts are better)
  - Segments are similar in size (differences are hard to detect)
  - You need to show changes over time (use line charts)
  
  ALWAYS ENSURE:
  - Clear, concise segment labels
  - Logical ordering of segments (typically largest to smallest)
  - Limited use of colors (avoid rainbow effect)
  - Provide insights about what the distribution means`,
  parameters: z.object({
    title: z.string().describe('The title of the chart'),
    data: z.array(z.object({
      name: z.string().describe('The name/category of the data segment'),
      value: z.number().describe('The value of the data segment'),
    })).describe('The data segments for the pie chart (best kept to 2-7 segments)'),
    insights: z.object({
      trend: z.number().optional().describe('A numerical trend percentage (positive or negative)'),
      description: z.string().optional().describe('A textual description/analysis of the data - highlight the main insight from the distribution'),
      icon: z.enum(['trending-up', 'trending-down', 'alert', 'info', 'check', 'x', 'star']).optional()
        .describe('Optional icon to display. If not provided, trend icon will be used automatically'),
    }).optional().describe('Optional AI-generated insights about the data'),
  }),
  execute: async ({ title, data, insights }) => {
    return { title, data, insights };
  },
});
