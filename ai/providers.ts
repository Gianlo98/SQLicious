import { openai } from "@ai-sdk/openai";

import {
  customProvider,
} from "ai";

export const model = customProvider({
  languageModels: {
    openai: openai.languageModel("gpt-4o-2024-08-06"),
  },
});

export type modelID = Parameters<(typeof model)["languageModel"]>["0"];
