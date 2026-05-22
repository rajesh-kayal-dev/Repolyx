import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().default(""),
});

// Since Next.js loads env variables differently depending on server/client side,
// we can do a safeParse of the public prefix env vars.
const parseEnv = () => {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!result.success) {
    console.error("❌ Invalid client environment variables:");
    result.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
    });
    if (typeof window === "undefined") {
      throw new Error("Invalid client environment variables configuration");
    }
  }

  return result.success ? result.data : { NEXT_PUBLIC_API_URL: "" };
};

export const env = parseEnv();
