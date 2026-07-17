import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { studentId, subject, marks, maxMarks, grade, semester, year } = body;
  try {
    const result = await prisma.result.update({
      where: { id: Number(id) },
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
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update result" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.result.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete result" }, { status: 500 });
  }
}
