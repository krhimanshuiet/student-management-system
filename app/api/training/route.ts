import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  const trainings = await prisma.training.findMany({
    where: search
      ? {
          OR: [
            { student: { name: { contains: search } } },
            { student: { rollNo: { contains: search } } },
          ],
        }
      : undefined,
    include: { student: true, company: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(trainings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentId, companyId, projectName, startDate, endDate, status, description } = body;
  if (!studentId || !companyId || !projectName || !startDate || !endDate || !description) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  try {
    const created = await prisma.training.create({
      data: {
        studentId: Number(studentId),
        companyId: Number(companyId),
        projectName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || "Ongoing",
        description,
      },
    });
    const training = await prisma.training.findUnique({
      where: { id: created.id },
      include: { student: true, company: true },
    });
    return NextResponse.json(training, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create training record" }, { status: 500 });
  }
}
