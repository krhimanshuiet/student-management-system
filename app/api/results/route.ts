import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  const results = await prisma.result.findMany({
    where: search
      ? { student: { name: { contains: search } } }
      : undefined,
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentId, subject, marks, maxMarks, grade, semester, year } = body;
  if (!studentId || !subject || marks === undefined || !maxMarks || !grade || !semester || !year) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  try {
    const created = await prisma.result.create({
      data: {
        studentId: Number(studentId),
        subject,
        marks: Number(marks),
        maxMarks: Number(maxMarks),
        grade,
        semester: Number(semester),
        year: Number(year),
      },
    });
    const result = await prisma.result.findUnique({
      where: { id: created.id },
      include: { student: true },
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create result" }, { status: 500 });
  }
}
