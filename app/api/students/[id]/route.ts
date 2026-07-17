import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: { trainings: { include: { company: true } }, results: true },
    });
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { rollNo, name, email, phone, address, course, year } = body;
  try {
    const student = await prisma.student.update({
      where: { id: Number(id) },
      data: { rollNo, name, email, phone, address, course, year: Number(year) },
    });
    return NextResponse.json(student);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.student.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
