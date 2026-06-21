import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import {
  ALL_PERMISSIONS,
  ROLE_PERMISSION_MATRIX,
  ROLES,
} from './seed-data';

async function seedPermissions(prisma: PrismaClient) {
  const permissionRecords = await Promise.all(
    ALL_PERMISSIONS.map((permission) =>
      prisma.permission.upsert({
        where: { key: permission.key },
        update: { description: permission.description },
        create: {
          key: permission.key,
          description: permission.description,
        },
      }),
    ),
  );

  return new Map(permissionRecords.map((p) => [p.key, p.id]));
}

async function seedRoles(
  prisma: PrismaClient,
  permissionIdByKey: Map<string, string>,
) {
  for (const roleDef of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: {
        name: roleDef.name,
        description: roleDef.description,
      },
    });

    const permissionKeys = ROLE_PERMISSION_MATRIX[roleDef.name];

    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    await prisma.rolePermission.createMany({
      data: permissionKeys.map((key) => ({
        roleId: role.id,
        permissionId: permissionIdByKey.get(key)!,
      })),
      skipDuplicates: true,
    });

    console.log(`  ✓ Role "${role.name}" — ${permissionKeys.length} permissions`);
  }
}

interface SeedUser {
  email: string;
  password: string;
  fullName: string;
  roleName: string;
  otpEnabled: boolean;
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@tms.local',
    password: 'Admin@123456',
    fullName: 'System Administrator',
    roleName: ROLES.ADMIN.name,
    otpEnabled: true,
  },
  {
    email: 'manager@tms.local',
    password: 'Manager@123456',
    fullName: 'Fleet Manager',
    roleName: ROLES.MANAGER.name,
    otpEnabled: false,
  },
  {
    email: 'dispatcher@tms.local',
    password: 'Dispatcher@123456',
    fullName: 'Senior Dispatcher',
    roleName: ROLES.DISPATCHER.name,
    otpEnabled: false,
  },
  {
    email: 'viewer@tms.local',
    password: 'Viewer@123456',
    fullName: 'Read-Only Viewer',
    roleName: ROLES.VIEWER.name,
    otpEnabled: false,
  },
];

async function seedUsers(prisma: PrismaClient) {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10);

  for (const u of SEED_USERS) {
    const role = await prisma.role.findUnique({ where: { name: u.roleName } });

    if (!role) {
      console.log(`  ✗ Role "${u.roleName}" not found — skipping user "${u.email}"`);
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, rounds);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        roleId: role.id,
        fullName: u.fullName,
        isActive: true,
        deletedAt: null,
        otpEnabled: u.otpEnabled,
      },
      create: {
        fullName: u.fullName,
        email: u.email,
        passwordHash,
        roleId: role.id,
        otpEnabled: u.otpEnabled,
        isActive: true,
      },
    });

    const otpLabel = u.otpEnabled ? 'OTP enabled' : 'OTP disabled';
    console.log(`  ✓ User "${u.email}" — role=${u.roleName} (${otpLabel})`);
  }
}

async function seedDemoVehicles(prisma: PrismaClient) {
  const existingCount = await prisma.vehicle.count();
  if (existingCount > 0) {
    console.log('  ∼ Vehicles already exist — skipping demo data');
    return;
  }

  const vehicles = [
    {
      vehicleCode: 'TRK-001',
      type: 'TRAILER' as const,
      status: 'ACTIVE' as const,
      manufacturer: 'Mercedes-Benz',
      model: 'Actros 1845',
      productionYear: 2022,
      capacityKg: 24000,
      plates: [
        { role: 'TRUCK_HEAD' as const, plateNumber: 'ABC-1234' },
        { role: 'TRAILER_UNIT' as const, plateNumber: 'XYZ-5678' },
      ],
    },
    {
      vehicleCode: 'TRK-002',
      type: 'JUMBO' as const,
      status: 'IN_TRIP' as const,
      manufacturer: 'Scania',
      model: 'R 500',
      productionYear: 2023,
      capacityKg: 26000,
      plates: [
        { role: 'TRUCK_HEAD' as const, plateNumber: 'DEF-9012' },
        { role: 'JUMBO' as const, plateNumber: 'GHI-3456' },
      ],
    },
    {
      vehicleCode: 'TRK-003',
      type: 'TRAILER' as const,
      status: 'IN_MAINTENANCE' as const,
      manufacturer: 'Volvo',
      model: 'FH 460',
      productionYear: 2021,
      capacityKg: 22000,
      plates: [
        { role: 'TRUCK_HEAD' as const, plateNumber: 'JKL-7890' },
        { role: 'TRAILER_UNIT' as const, plateNumber: 'MNO-1234' },
      ],
    },
    {
      vehicleCode: 'TRK-004',
      type: 'JUMBO' as const,
      status: 'OUT_OF_SERVICE' as const,
      manufacturer: 'MAN',
      model: 'TGX 18.510',
      productionYear: 2020,
      capacityKg: 25000,
      plates: [
        { role: 'TRUCK_HEAD' as const, plateNumber: 'PQR-5678' },
        { role: 'JUMBO' as const, plateNumber: 'STU-9012' },
      ],
    },
  ];

  for (const v of vehicles) {
    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleCode: v.vehicleCode,
        type: v.type,
        status: v.status,
        manufacturer: v.manufacturer,
        model: v.model,
        productionYear: v.productionYear,
        capacityKg: v.capacityKg,
      },
    });

    for (const plate of v.plates) {
      await prisma.vehiclePlate.create({
        data: {
          vehicleId: vehicle.id,
          role: plate.role,
          plateNumber: plate.plateNumber,
        },
      });
    }

    const statuses: Array<{ old: typeof v.status; new: typeof v.status }> = [];
    if (v.status === 'IN_MAINTENANCE') {
      statuses.push({ old: 'ACTIVE', new: 'IN_MAINTENANCE' });
    } else if (v.status === 'OUT_OF_SERVICE') {
      statuses.push({ old: 'ACTIVE', new: 'IN_MAINTENANCE' });
      statuses.push({ old: 'IN_MAINTENANCE', new: 'OUT_OF_SERVICE' });
    } else if (v.status === 'IN_TRIP') {
      statuses.push({ old: 'ACTIVE', new: 'IN_TRIP' });
    }

    for (const s of statuses) {
      await prisma.vehicleStatusHistory.create({
        data: {
          vehicleId: vehicle.id,
          oldStatus: s.old,
          newStatus: s.new,
          changedAt: new Date(Date.now() - 86400000),
        },
      });
    }

    console.log(`  ✓ Vehicle "${v.vehicleCode}" — ${v.status} (${v.plates.length} plates)`);
  }
}

async function seedDemoDrivers(prisma: PrismaClient) {
  const existingCount = await prisma.driver.count();
  if (existingCount > 0) {
    console.log('  ∼ Drivers already exist — skipping demo data');
    return;
  }

  const drivers = [
    {
      driverCode: 'DRV-001',
      fullName: 'Ahmed Hassan',
      phone: '+20 100 111 2233',
      nationalId: '29801011234567',
      licenseNumber: 'EG-DL-2023-001',
      licenseExpiry: new Date('2028-06-15'),
      status: 'ACTIVE' as const,
    },
    {
      driverCode: 'DRV-002',
      fullName: 'Mohamed Ali',
      phone: '+20 122 222 3344',
      nationalId: '28503022345678',
      licenseNumber: 'EG-DL-2022-002',
      licenseExpiry: new Date('2027-11-30'),
      status: 'IN_TRIP' as const,
    },
    {
      driverCode: 'DRV-003',
      fullName: 'Sara Ahmed',
      phone: '+20 155 333 4455',
      nationalId: '29207033456789',
      licenseNumber: 'EG-DL-2024-003',
      licenseExpiry: new Date('2029-03-22'),
      status: 'INACTIVE' as const,
      notes: 'On personal leave until further notice',
    },
    {
      driverCode: 'DRV-004',
      fullName: 'Khaled Mahmoud',
      phone: '+20 100 444 5566',
      nationalId: '29011044567890',
      licenseNumber: 'EG-DL-2021-004',
      licenseExpiry: new Date('2026-09-10'),
      status: 'SUSPENDED' as const,
      notes: 'License under review — expired medical certificate',
    },
  ];

  for (const d of drivers) {
    const driver = await prisma.driver.create({
      data: {
        driverCode: d.driverCode,
        fullName: d.fullName,
        phone: d.phone,
        nationalId: d.nationalId,
        licenseNumber: d.licenseNumber,
        licenseExpiry: d.licenseExpiry,
        status: d.status,
        notes: d.notes ?? null,
      },
    });

    const histories: Array<{ old: typeof d.status | null; new: typeof d.status }> = [];

    if (d.status === 'IN_TRIP') {
      histories.push({ old: 'ACTIVE', new: 'IN_TRIP' });
    } else if (d.status === 'INACTIVE') {
      histories.push({ old: 'ACTIVE', new: 'INACTIVE' });
    } else if (d.status === 'SUSPENDED') {
      histories.push({ old: 'ACTIVE', new: 'INACTIVE' });
      histories.push({ old: 'INACTIVE', new: 'SUSPENDED' });
    }

    for (const h of histories) {
      await prisma.driverStatusHistory.create({
        data: {
          driverId: driver.id,
          oldStatus: h.old,
          newStatus: h.new,
          changedAt: new Date(Date.now() - 86400000 * 2),
        },
      });
    }

    console.log(`  ✓ Driver "${d.fullName}" — ${d.status} (${d.licenseNumber})`);
  }
}

function printCredentials(prisma: PrismaClient) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('              SEEDED ACCOUNTS');
  console.log('═══════════════════════════════════════════════════════');

  for (const u of SEED_USERS) {
    console.log(`  ${u.roleName.toUpperCase()}`);
    console.log(`    Email:    ${u.email}`);
    console.log(`    Password: ${u.password}`);
    console.log(`    Role:     ${u.roleName}`);
    console.log(`    OTP:      ${u.otpEnabled ? 'enabled (check server logs for code)' : 'disabled'}`);
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════\n');
}

async function main() {
  console.log('=== TMS Database Seed ===\n');

  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('── Permissions ──');
    const permissionIdByKey = await seedPermissions(prisma);
    console.log(`  ✓ ${permissionIdByKey.size} permissions upserted\n`);

    console.log('── Roles ──');
    await seedRoles(prisma, permissionIdByKey);

    console.log('\n── Users ──');
    await seedUsers(prisma);

    console.log('\n── Demo Vehicles ──');
    await seedDemoVehicles(prisma);

    console.log('\n── Demo Drivers ──');
    await seedDemoDrivers(prisma);

    printCredentials(prisma);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
