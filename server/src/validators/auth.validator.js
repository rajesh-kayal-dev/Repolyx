import { z } from "zod";

export const authSchemas = {
  loginSchema: z.object({
    code: z.string().min(1, "Authorization code is required"),
  }),

  sessionCheck: z.object({
    sessionId: z.string().optional(),
  }),
};
