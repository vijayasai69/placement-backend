import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env.js";
import { zodToJsonSchema } from "zod-to-json-schema";

export const chatGroq = new ChatOpenAI({
  openAIApiKey: env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
  temperature: 0.1,
  maxRetries: 3,
}) as any;

export const chatGroqBackground = new ChatOpenAI({
  openAIApiKey: env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini", 
  temperature: 0.1,
  maxRetries: 3,
}) as any;

/**
 * Call AI API with structured JSON output requirements.
 */
export async function getStructuredAIResponse<T>(prompt: string, schema?: any, useBackgroundModel: boolean = false, useNvidia: boolean = false): Promise<T> {
  
  let schemaInstruction = "";
  if (schema) {
    try {
      const jsonSchema = zodToJsonSchema(schema);
      schemaInstruction = `\n\nYour output must adhere to this JSON schema structure:\n${JSON.stringify(jsonSchema, null, 2)}`;
    } catch (e) {
      schemaInstruction = `\n\nYour output must adhere to this JSON schema structure:\n${JSON.stringify(schema, null, 2)}`;
    }
  }

  let modelToUse = useBackgroundModel ? chatGroqBackground : chatGroq;
  
  if (useNvidia && env.NVIDIA_API_KEY) {
    modelToUse = new ChatOpenAI({
      openAIApiKey: env.NVIDIA_API_KEY,
      modelName: "meta/llama-3.1-70b-instruct",
      temperature: 0.1,
      maxRetries: 3,
      configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
      },
    }) as any;
  }

  const response = await modelToUse.invoke([
    {
      role: "system",
      content: "You are an AI placement and career assistant. You must output raw JSON only, enclosed in ```json ... ``` code blocks. Do not write explanation text." + schemaInstruction
    },
    {
      role: "user",
      content: prompt
    }
  ]);

  const content = response.content as string;
  
  // Robust JSON extraction by finding the first { or [ and last } or ]
  const firstBrace = content.indexOf('{');
  const firstBracket = content.indexOf('[');
  
  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error(`No JSON object or array found in response: ${content}`);
  }
  
  const startIdx = (firstBrace !== -1 && firstBracket !== -1) 
    ? Math.min(firstBrace, firstBracket) 
    : Math.max(firstBrace, firstBracket);
    
  const lastBrace = content.lastIndexOf('}');
  const lastBracket = content.lastIndexOf(']');
  
  const endIdx = Math.max(lastBrace, lastBracket);
  
  if (startIdx !== -1 && endIdx >= startIdx) {
    const rawJson = content.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(rawJson) as T;
    } catch (e) {
      console.error("Failed to parse extracted JSON:", rawJson);
      throw e;
    }
  }
  
  throw new Error(`Failed to extract valid JSON bounds from: ${content}`);
}
