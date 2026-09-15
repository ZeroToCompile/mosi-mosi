import path from "node:path";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";

const socialProviders = {
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
};

export const auth = betterAuth({
  database: new Database(path.join(process.cwd(), "sqlite.db")),
  emailAndPassword: {
    enabled: true,
  },
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  plugins: [nextCookies()],
});
