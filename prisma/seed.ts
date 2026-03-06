import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await hash("Admin@123", 12);

  // Create Manager (admin)
  const admin = await prisma.staff.upsert({
    where: { email: "admin@cirronyx.com" },
    update: { role: "MANAGER" },
    create: {
      staffId: "E-001",
      firstName: "Super",
      lastName: "Admin",
      email: "admin@cirronyx.com",
      phone: "+237600000000",
      department: "ADMIN",
      role: "MANAGER",
      status: "ACTIVE",
      passwordHash,
    },
  });
  console.log(`✅ Manager created: ${admin.email}`);

  // Create Accountant
  const accountantHash = await hash("Account@123", 12);
  await prisma.staff.upsert({
    where: { email: "accountant@cirronyx.com" },
    update: {},
    create: {
      staffId: "E-002",
      firstName: "Jane",
      lastName: "Accountant",
      email: "accountant@cirronyx.com",
      phone: "+237601000000",
      department: "ADMIN",
      role: "ACCOUNTANT",
      status: "ACTIVE",
      passwordHash: accountantHash,
    },
  });
  console.log("✅ Accountant created: accountant@cirronyx.com");

  // Create Staff member
  const staffHash = await hash("Staff@123", 12);
  await prisma.staff.upsert({
    where: { email: "staff@cirronyx.com" },
    update: {},
    create: {
      staffId: "E-003",
      firstName: "John",
      lastName: "Staff",
      email: "staff@cirronyx.com",
      phone: "+237602000000",
      department: "OFFIZONE",
      role: "STAFF",
      status: "ACTIVE",
      passwordHash: staffHash,
    },
  });
  console.log("✅ Staff created: staff@cirronyx.com");

  // Create sample catalog entries
  const catalogEntries = [
    { businessUnit: "JOYSUN" as const, serviceName: "Flyers (A5)", basePrice: 15000 },
    { businessUnit: "JOYSUN" as const, serviceName: "Business Cards (100pcs)", basePrice: 10000 },
    { businessUnit: "JOYSUN" as const, serviceName: "Banners (Large)", basePrice: 35000 },
    { businessUnit: "JOYSUN" as const, serviceName: "Brochures (A4 Tri-fold)", basePrice: 25000 },
    { businessUnit: "JOYSUN" as const, serviceName: "Posters (A3)", basePrice: 8000 },
    { businessUnit: "OFFIZONE" as const, serviceName: "Hot Desk (Daily)", basePrice: 5000 },
    { businessUnit: "OFFIZONE" as const, serviceName: "Dedicated Desk (Monthly)", basePrice: 50000 },
    { businessUnit: "OFFIZONE" as const, serviceName: "Private Office (Monthly)", basePrice: 150000 },
    { businessUnit: "OFFIZONE" as const, serviceName: "Meeting Room (Hourly)", basePrice: 10000 },
    { businessUnit: "OFFIZONE" as const, serviceName: "Event Space (Daily)", basePrice: 75000 },
  ];

  for (const entry of catalogEntries) {
    await prisma.catalog.upsert({
      where: { id: 0 },
      update: {},
      create: entry,
    });
  }
  console.log(`✅ ${catalogEntries.length} catalog entries created`);

  // Create sample machines
  const machines = [
    { name: "Konica Minolta C3070", model: "C3070", status: "OPERATIONAL" as const },
    { name: "Ricoh Pro C5300s", model: "C5300s", status: "OPERATIONAL" as const },
    { name: "Laminator A3", model: "FGK-320", status: "OPERATIONAL" as const },
    { name: "Paper Cutter", model: "Polar 66", status: "OPERATIONAL" as const },
  ];

  for (const machine of machines) {
    await prisma.machine.create({ data: machine });
  }
  console.log(`✅ ${machines.length} machines created`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
