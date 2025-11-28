import { z } from "zod";

const envSchema = z.object({
  FIREBASE_ADMIN_KEY: z.string().min(1, "FIREBASE_ADMIN_KEY is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const processEnv = {
  FIREBASE_ADMIN_KEY: process.env.FIREBASE_ADMIN_KEY,
  NODE_ENV: process.env.NODE_ENV,
};

// Validate environment variables
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
