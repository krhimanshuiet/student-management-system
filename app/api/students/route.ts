import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  const students = await prisma.student.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { rollNo: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rollNo, name, email, phone, address, course, year } = body;
  if (!rollNo || !name || !email || !phone || !address || !course || !year) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  try {
    const student = await prisma.student.create({
      data: { rollNo, name, email, phone, address, course, year: Number(year) },
    });
    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Roll number already exists" }, { status: 409 });
  }
}
