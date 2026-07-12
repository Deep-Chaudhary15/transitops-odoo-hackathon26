// prisma/seed.ts
import { PrismaClient, Role, VehicleType, VehicleStatus, DriverStatus, TripStatus, MaintenanceType, MaintenanceStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Marcus Chen",
      email: "admin@transitops.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "manager@transitops.com",
      passwordHash,
      role: Role.FLEET_MANAGER,
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      name: "James Wilson",
      email: "driver@transitops.com",
      passwordHash,
      role: Role.DRIVER,
    },
  });

  const safetyOfficer = await prisma.user.create({
    data: {
      name: "Robert Fox",
      email: "safety@transitops.com",
      passwordHash,
      role: Role.SAFETY_OFFICER,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Emily Blunt",
      email: "analyst@transitops.com",
      passwordHash,
      role: Role.FINANCIAL_ANALYST,
    },
  });

  console.log("Created users:", { admin: admin.email, manager: manager.email, driverUser: driverUser.email });

  // Create Vehicles
  const vehiclesData = [
    { registrationNumber: "FLT-9204", model: "eCascadia", make: "Freightliner", year: 2023, type: VehicleType.TRUCK, capacityKg: 18000, odometer: 45200, acquisitionCost: 150000, region: "Saurashtra", status: VehicleStatus.ON_TRIP },
    { registrationNumber: "FLT-7112", model: "VNR Electric", make: "Volvo", year: 2022, type: VehicleType.TRUCK, capacityKg: 15000, odometer: 32400, acquisitionCost: 140000, region: "South Gujarat", status: VehicleStatus.AVAILABLE },
    { registrationNumber: "FLT-3309", model: "E-Transit", make: "Ford", year: 2023, type: VehicleType.VAN, capacityKg: 3500, odometer: 12800, acquisitionCost: 55000, region: "North Gujarat", status: VehicleStatus.IN_SHOP },
    { registrationNumber: "FLT-8821", model: "F-150 Lightning", make: "Ford", year: 2022, type: VehicleType.PICKUP, capacityKg: 2000, odometer: 18900, acquisitionCost: 65000, region: "Central Gujarat", status: VehicleStatus.ON_TRIP },
    { registrationNumber: "FLT-1045", model: "Semi", make: "Tesla", year: 2024, type: VehicleType.TRUCK, capacityKg: 20000, odometer: 5400, acquisitionCost: 180000, region: "Kutch", status: VehicleStatus.AVAILABLE },
    { registrationNumber: "FLT-5520", model: "Sprinter", make: "Mercedes-Benz", year: 2021, type: VehicleType.VAN, capacityKg: 4000, odometer: 68000, acquisitionCost: 50000, region: "Central Gujarat", status: VehicleStatus.DECOMMISSIONED },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.create({ data: v });
    vehicles.push(vehicle);
  }
  console.log(`Created ${vehicles.length} vehicles.`);

  // Create Drivers
  const driversData = [
    { name: "James Wilson", licenseNumber: "DL-99201", licenseExpiry: new Date("2029-05-12"), licenseCategory: "Class A CDL", contact: "+1 (555) 019-2834", email: "driver@transitops.com", safetyScore: 98.5, status: DriverStatus.ON_TRIP },
    { name: "Sarah Connor", licenseNumber: "DL-77312", licenseExpiry: new Date("2028-11-20"), licenseCategory: "Class A CDL", contact: "+1 (555) 014-9982", email: "sconnor@transitops.com", safetyScore: 99.2, status: DriverStatus.AVAILABLE },
    { name: "Robert Fox", licenseNumber: "DL-33409", licenseExpiry: new Date("2026-03-15"), licenseCategory: "Class B CDL", contact: "+1 (555) 018-4720", email: "rfox@transitops.com", safetyScore: 82.0, status: DriverStatus.OFF_DUTY },
    { name: "Emily Blunt", licenseNumber: "DL-88221", licenseExpiry: new Date("2027-09-04"), licenseCategory: "Class A CDL", contact: "+1 (555) 017-3819", email: "eblunt@transitops.com", safetyScore: 96.8, status: DriverStatus.ON_TRIP },
    { name: "David Miller", licenseNumber: "DL-10452", licenseExpiry: new Date("2025-12-01"), licenseCategory: "Class A CDL", contact: "+1 (555) 015-8829", email: "dmiller@transitops.com", safetyScore: 68.4, status: DriverStatus.SUSPENDED, isSuspended: true, suspendedReason: "Multiple speed violations" },
  ];

  const drivers = [];
  for (const d of driversData) {
    const driver = await prisma.driver.create({ data: d });
    drivers.push(driver);
  }
  console.log(`Created ${drivers.length} drivers.`);

  // Create Trips
  const tripsData = [
    {
      vehicleId: vehicles.find(v => v.registrationNumber === "FLT-9204")!.id,
      driverId: drivers.find(d => d.name === "James Wilson")!.id,
      source: "Ahmedabad, GJ",
      destination: "Rajkot, GJ",
      cargoWeightKg: 12500,
      plannedDistance: 215,
      status: TripStatus.ACTIVE,
      dispatchedAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
    },
    {
      vehicleId: vehicles.find(v => v.registrationNumber === "FLT-8821")!.id,
      driverId: drivers.find(d => d.name === "Emily Blunt")!.id,
      source: "Vadodara, GJ",
      destination: "Surat, GJ",
      cargoWeightKg: 1800,
      plannedDistance: 150,
      status: TripStatus.ACTIVE,
      dispatchedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    },
    {
      vehicleId: vehicles.find(v => v.registrationNumber === "FLT-7112")!.id,
      driverId: drivers.find(d => d.name === "Sarah Connor")!.id,
      source: "Gandhinagar, GJ",
      destination: "Bhavnagar, GJ",
      cargoWeightKg: 11000,
      plannedDistance: 200,
      actualDistance: 205,
      status: TripStatus.COMPLETED,
      dispatchedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
      completedAt: new Date(Date.now() - 86400000 * 1.5),
    },
    {
      vehicleId: vehicles.find(v => v.registrationNumber === "FLT-1045")!.id,
      driverId: drivers.find(d => d.name === "Sarah Connor")!.id,
      source: "Bhuj, GJ",
      destination: "Jamnagar, GJ",
      cargoWeightKg: 8500,
      plannedDistance: 280,
      status: TripStatus.PENDING,
    },
  ];

  const trips = [];
  for (const t of tripsData) {
    const trip = await prisma.trip.create({ data: t });
    trips.push(trip);
  }
  console.log(`Created ${trips.length} trips.`);

  // Create Maintenance
  await prisma.maintenance.create({
    data: {
      vehicleId: vehicles.find(v => v.registrationNumber === "FLT-3309")!.id,
      type: MaintenanceType.INSPECTION,
      cost: 450,
      scheduledDate: new Date(Date.now() - 86400000),
      status: MaintenanceStatus.IN_PROGRESS,
      notes: "Routine electrical system check and software update.",
    },
  });

  await prisma.maintenance.create({
    data: {
      vehicleId: vehicles.find(v => v.registrationNumber === "FLT-7112")!.id,
      type: MaintenanceType.OIL_CHANGE,
      cost: 150,
      scheduledDate: new Date(Date.now() - 86400000 * 10),
      completedDate: new Date(Date.now() - 86400000 * 10),
      status: MaintenanceStatus.CLOSED,
      notes: "Engine oil and filter replaced.",
    },
  });

  // Create Fuel Logs
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicles.find(v => v.registrationNumber === "FLT-7112")!.id,
      liters: 320,
      costPerLiter: 1.45,
      totalCost: 464,
      odometer: 31800,
      date: new Date(Date.now() - 86400000 * 4),
    },
  });

  // Create Expenses
  await prisma.expense.create({
    data: {
      tripId: trips.find(t => t.status === TripStatus.COMPLETED)!.id,
      category: "Tolls",
      amount: 45.50,
      date: new Date(Date.now() - 86400000 * 2),
      notes: "Florida Turnpike tolls",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
