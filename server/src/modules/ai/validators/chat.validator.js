import { z } from "zod";

export const createSessionSchema = z.object({
  repositoryId: z.string().min(1, "repositoryId is required"),
  title: z.string().max(200).optional().default("New AI Conversation"),
});

export const listSessionsSchema = z.object({
  repositoryId: z.string().min(1, "repositoryId is required"),
});

export const getSessionSchema = z.object({
  id: z.string().min(1, "session id is required"),
});

export const deleteSessionSchema = z.object({
  id: z.string().min(1, "session id is required"),
});

export const AVAILABLE_MODELS = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "freemodel", description: "Best for deep code analysis" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", provider: "freemodel", description: "Fast & lightweight" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "gemini", description: "Free & fast for quick answers" },
  { id: "openai/gpt-4o", label: "GPT-4o", provider: "openrouter", description: "Best for general tasks" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek V3", provider: "openrouter", description: "Powerful open-source reasoning" },
  { id: "mistralai/mistral-small-3.1-24b-instruct", label: "Mistral Small 3.1", provider: "openrouter", description: "Fast & efficient" },
  { id: "qwen/qwen-2.5-72b-instruct", label: "Qwen 2.5 72B", provider: "openrouter", description: "Strong general-purpose" },
];

export const chatSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  message: z.string().min(1, "message is required").max(10000, "message too long"),
  activeFile: z.string().max(500).optional(),
  provider: z.enum(["freemodel", "gemini", "openrouter"]).optional(),
  model: z.string().max(100).optional(),
  mode: z.enum(["beginner", "developer"]).optional().default("developer"),
  contextScope: z.enum(["repo", "file", "folder", "dependencies"]).optional().default("repo"),
});

export const getPromptsSchema = z.object({
  repositoryId: z.string().min(1, "repositoryId is required"),
});
