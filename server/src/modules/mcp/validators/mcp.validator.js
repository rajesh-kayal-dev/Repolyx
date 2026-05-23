import { z } from "zod";

export const validationRunSchema = z.object({
  checks: z.array(z.string()).optional(),
});

export const workspaceQuerySchema = z.object({
  host: z.string().default("localhost"),
  port: z.coerce.number().int().positive().max(65535).default(3939),
});
