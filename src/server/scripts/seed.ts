/**
 * Idempotent database seed: roles, a super-admin user, and base settings.
 * Run with: `pnpm seed` (sets NODE_OPTIONS=--conditions=react-server so the
 * server-only modules load outside Next).
 */
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  // Dynamic imports so dotenv populates process.env before env.ts evaluates.
  const mongoose = (await import('mongoose')).default;
  const { connectToDatabase } = await import('@/server/db/mongoose');
  const { env } = await import('@/server/config/env');
  const { RoleModel } = await import('@/server/models/role.model');
  const { UserModel } = await import('@/server/models/user.model');
  const { settingsRepository } = await import('@/server/modules/settings/settings.repository');
  const { SETTINGS_DEFAULTS } = await import('@/server/modules/settings/settings.service');
  const { hashPassword } = await import('@/server/utils/password');
  const { ROLES, ROLE_PERMISSIONS } = await import('@/lib/constants');

  const ROLE_LABELS: Record<string, { name: string; description: string }> = {
    SuperAdmin: { name: 'Super Admin', description: 'Full access to every module and setting.' },
    HotelManager: {
      name: 'Hotel Manager',
      description: 'Rooms, inventory, pricing, bookings and guests.',
    },
    BarManager: { name: 'Bar Manager', description: 'RSVPs, tables, events and the bar menu.' },
    FrontDesk: { name: 'Front Desk', description: 'Daily arrivals/departures and guest check-in.' },
    ContentEditor: { name: 'Content Editor', description: 'Site content, media, banners and SEO.' },
    Guest: { name: 'Guest', description: 'Public guest account (bookings, RSVPs, reviews).' },
  };

  console.log('→ Connecting to MongoDB…');
  await connectToDatabase();

  console.log('→ Seeding roles…');
  for (const key of Object.values(ROLES)) {
    const label = ROLE_LABELS[key]!;
    await RoleModel.findOneAndUpdate(
      { key },
      {
        $set: {
          name: label.name,
          description: label.description,
          permissions: ROLE_PERMISSIONS[key] ?? [],
          isSystem: true,
        },
        $setOnInsert: { key },
      },
      { upsert: true, new: true },
    );
    console.log(`   • ${label.name} (${(ROLE_PERMISSIONS[key] ?? []).length} permissions)`);
  }

  console.log('→ Seeding super-admin user…');
  const existing = await UserModel.findOne({ email: env.seedAdmin.email.toLowerCase() });
  if (existing) {
    if (existing.role !== ROLES.SUPER_ADMIN) {
      existing.role = ROLES.SUPER_ADMIN;
      await existing.save();
    }
    console.log(`   • Exists: ${env.seedAdmin.email} (role ensured: SuperAdmin)`);
  } else {
    const passwordHash = await hashPassword(env.seedAdmin.password);
    await UserModel.create({
      name: env.seedAdmin.name,
      email: env.seedAdmin.email.toLowerCase(),
      passwordHash,
      role: ROLES.SUPER_ADMIN,
      isActive: true,
      emailVerifiedAt: new Date(),
    });
    console.log(`   • Created: ${env.seedAdmin.email} / ${env.seedAdmin.password}`);
  }

  console.log('→ Seeding base settings…');
  for (const [namespace, values] of Object.entries(SETTINGS_DEFAULTS)) {
    const current = await settingsRepository.get(namespace);
    if (!current) {
      await settingsRepository.upsert(namespace, values as Record<string, unknown>);
      console.log(`   • ${namespace}`);
    } else {
      console.log(`   • ${namespace} (exists, skipped)`);
    }
  }

  console.log('\n✓ Seed complete.\n');
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err);
  process.exit(1);
});
