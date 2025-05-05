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
  description: 'Display a line chart with the given data',
  parameters: z.object({
    title: z.string().describe('The title of the chart'),
    data: z.array(z.object({
      date: z.string().describe('The date of the data point'),
      value: z.number().describe('The value of the data point'),
    })).describe('The data points for the chart'),
  }),
  execute: async ({ title, data }) => {
    return { title, data };
  },
});

export const displayBarchartTool = tool({
  description: 'Display a bar chart with the given data',
  parameters: z.object({
    title: z.string().describe('The title of the chart'),
    data: z.array(z.object({
      category: z.string().describe('The category of the data point'),
      value: z.number().describe('The value of the data point'),
    })).describe('The data points for the chart'),
  }),
  execute: async ({ title, data }) => {
    return { title, data };
  },
});

export const displayPiechartTool = tool({
  description: 'Display a pie/donut chart with the given data',
  parameters: z.object({
    title: z.string().describe('The title of the chart'),
    data: z.array(z.object({
      name: z.string().describe('The name/category of the data segment'),
      value: z.number().describe('The value of the data segment'),
    })).describe('The data segments for the pie chart'),
  }),
  execute: async ({ title, data }) => {
    return { title, data };
  },
});
