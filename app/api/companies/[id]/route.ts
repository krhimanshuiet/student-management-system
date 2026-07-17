import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, industry, location, contactPerson, email, phone } = body;
  try {
    const company = await prisma.company.update({
      where: { id: Number(id) },
      data: { name, industry, location, contactPerson, email, phone },
    });
    return NextResponse.json(company);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.company.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
