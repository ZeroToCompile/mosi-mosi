/**
 * Migrate Better Auth schema and seed the initial admin user.
 *
 * Usage:
 *   DATABASE_URL=... BETTER_AUTH_SECRET=... npm run auth:setup
 *
 * Optional:
 *   SEED_ADMIN_EMAIL (default admin@mosimosi.local)
 *   SEED_ADMIN_PASSWORD (default MosiMosiAdmin!2026)
 *   SEED_ADMIN_NAME (default Admin)
 */
import { auth } from '../auth';

async function main() {
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? 'admin@mosimosi.local'
  ).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'MosiMosiAdmin!2026';
  const name = process.env.SEED_ADMIN_NAME ?? 'Admin';

  const context = await auth.$context;
  const existing = await context.internalAdapter.findUserByEmail(email);

  if (existing?.user) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const created = await context.internalAdapter.createUser(
    {
      email,
      name,
      emailVerified: true,
      role: 'admin',
    },
    { method: 'admin' },
  );

  if (!created) {
    throw new Error('Failed to create admin user');
  }

  const hash = await context.password.hash(password);
  await context.internalAdapter.linkAccount({
    userId: created.id,
    providerId: 'credential',
    accountId: created.id,
    password: hash,
  });

  console.log(`Seeded admin: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
