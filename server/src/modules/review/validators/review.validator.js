import { z } from "zod";

export const createReviewSchema = z.object({
  repositoryId: z.string().min(1, "repositoryId is required"),
  prUrl: z.string().url("prUrl must be a valid URL").optional(),
  diffContent: z.string().min(10, "diffContent must be at least 10 characters").optional(),
  title: z.string().max(200).optional(),
}).refine(data => data.prUrl || data.diffContent, {
  message: "Either prUrl or diffContent is required",
});

export const analyzeReviewSchema = z.object({
  id: z.string().min(1, "review id is required"),
  provider: z.enum(["freemodel", "gemini", "openrouter"]).optional(),
  model: z.string().max(100).optional(),
});

export const getReviewSchema = z.object({
  id: z.string().min(1, "review id is required"),
});

export const deleteReviewSchema = z.object({
  id: z.string().min(1, "review id is required"),
});
