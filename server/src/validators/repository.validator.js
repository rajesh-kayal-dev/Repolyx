import { z } from "zod";

export const repositorySchemas = {
  importRepo: z.object({
    repoData: z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      fullName: z.string().min(1),
      visibility: z.string().optional(),
      defaultBranch: z.string().optional(),
      language: z.string().optional(),
      description: z.string().optional().nullable(),
      cloneUrl: z.string().optional(),
    }),
  }),

  repoId: z.object({
    id: z.string().min(1),
  }),

  analysis: z.object({
    type: z.enum(["architecture", "dependencies", "auth", "api", "security"]),
  }),

  pagination: z.object({
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    offset: z.coerce.number().int().min(0).optional().default(0),
  }),

  repositoryQuery: z.object({
    query: z.string().min(1).max(5000),
    selectedFile: z.string().optional(),
    selectedBranch: z.string().optional(),
  }),
};
