import { z } from "zod";

export const settingsSchemas = {
  profileUpdate: z.object({
    displayName: z.string().min(1, "Display name is required"),
    workspaceName: z.string().min(1, "Workspace name is required"),
  }),

  notificationUpdate: z.object({
    emailSummary: z.boolean(),
    pullRequestReview: z.boolean(),
    systemStatus: z.boolean(),
  }),

  appearanceUpdate: z.object({
    theme: z.enum(["Dark", "Light", "Midnight Special", "System Default"]),
    density: z.enum(["Comfortable", "Compact", "Spacious"]),
  }),

  aiPreferenceUpdate: z.object({
    defaultModel: z.string().min(1),
    autoAudit: z.boolean(),
    contextTips: z.boolean(),
    backgroundIndexing: z.boolean(),
  }),

  accessTokenCreate: z.object({
    name: z.string().min(1, "Token name is required"),
    expiresInDays: z.number().int().positive().optional(),
  }),
};
