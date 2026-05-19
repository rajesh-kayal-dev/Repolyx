import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:5000"),
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
    // On the client browser we don't want to crash but we want to know,
    // on build/server side we could throw.
    if (typeof window === "undefined") {
      throw new Error("Invalid client environment variables configuration");
    }
  }

  return result.success ? result.data : { NEXT_PUBLIC_API_URL: "http://localhost:5000" };
};

export const env = parseEnv();
