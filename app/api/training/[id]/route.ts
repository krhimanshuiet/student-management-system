import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { studentId, companyId, projectName, startDate, endDate, status, description } = body;
  try {
    const training = await prisma.training.update({
      where: { id: Number(id) },
      data: {
        studentId: Number(studentId),
        companyId: Number(companyId),
        projectName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        description,
      },
    });
    return NextResponse.json(training);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update training record" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.training.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
