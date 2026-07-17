import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: hashed },
  });

  const s1 = await prisma.student.upsert({
    where: { rollNo: "BCA001" },
    update: {},
    create: {
      rollNo: "BCA001",
      name: "Abhishek Kumar",
      email: "abhishek@example.com",
      phone: "9876543210",
      address: "Aurangabad, Bihar",
      course: "BCA",
      year: 3,
    },
  });

  const s2 = await prisma.student.upsert({
    where: { rollNo: "BCA002" },
    update: {},
    create: {
      rollNo: "BCA002",
      name: "Chirag Singh",
      email: "chirag@example.com",
      phone: "9876543211",
      address: "Patna, Bihar",
      course: "BCA",
      year: 3,
    },
  });

  const s3 = await prisma.student.upsert({
    where: { rollNo: "BCA003" },
    update: {},
    create: {
      rollNo: "BCA003",
      name: "Mohit Raj",
      email: "mohit@example.com",
      phone: "9876543212",
      address: "Gaya, Bihar",
      course: "BCA",
      year: 3,
    },
  });

  const s4 = await prisma.student.upsert({
    where: { rollNo: "BCA004" },
    update: {},
    create: {
      rollNo: "BCA004",
      name: "Om Prakash Kumar",
      email: "om@example.com",
      phone: "9876543213",
      address: "Aurangabad, Bihar",
      course: "BCA",
      year: 3,
    },
  });

  const c1 = await prisma.company.upsert({
    where: { name: "TechCorp Pvt. Ltd." },
    update: {},
    create: {
      name: "TechCorp Pvt. Ltd.",
      industry: "IT",
      location: "Patna, Bihar",
      contactPerson: "Rajan Sharma",
      email: "hr@techcorp.com",
      phone: "9001234567",
    },
  });

  const c2 = await prisma.company.upsert({
    where: { name: "Infosys Ltd." },
    update: {},
    create: {
      name: "Infosys Ltd.",
      industry: "IT Services",
      location: "Bangalore, Karnataka",
      contactPerson: "Priya Mehta",
      email: "hr@infosys.com",
      phone: "9002345678",
    },
  });

  await prisma.training.createMany({
    data: [
      {
        studentId: s1.id,
        companyId: c1.id,
        projectName: "Inventory Management System",
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-08-31"),
        status: "Completed",
        description: "Developed inventory module using React and Node.js",
      },
      {
        studentId: s2.id,
        companyId: c2.id,
        projectName: "HR Portal",
        startDate: new Date("2025-07-01"),
        endDate: new Date("2025-09-30"),
        status: "Ongoing",
        description: "Building HR management portal with Next.js",
      },
    ],
  });

  await prisma.result.createMany({
    data: [
      { studentId: s1.id, subject: "DBMS", marks: 85, maxMarks: 100, grade: "A", semester: 5, year: 2025 },
      { studentId: s1.id, subject: "Web Technology", marks: 90, maxMarks: 100, grade: "A+", semester: 5, year: 2025 },
      { studentId: s2.id, subject: "DBMS", marks: 78, maxMarks: 100, grade: "B+", semester: 5, year: 2025 },
      { studentId: s3.id, subject: "DBMS", marks: 82, maxMarks: 100, grade: "A", semester: 5, year: 2025 },
      { studentId: s4.id, subject: "Web Technology", marks: 88, maxMarks: 100, grade: "A", semester: 5, year: 2025 },
    ],
  });

  console.log("Seed completed successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
