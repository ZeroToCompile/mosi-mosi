import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for Better Auth');
}

const trustedOrigins = (
  process.env.BETTER_AUTH_TRUSTED_ORIGINS ??
  [
    'http://localhost:3020',
    'http://127.0.0.1:3020',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].join(',')
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

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
  database: new Pool({
    connectionString: databaseUrl,
  }),
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.API_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  trustedOrigins,
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  plugins: [admin()],
});
