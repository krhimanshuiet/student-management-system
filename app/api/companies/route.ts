import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  const companies = await prisma.company.findMany({
    where: search ? { name: { contains: search } } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, industry, location, contactPerson, email, phone } = body;
  if (!name || !industry || !location || !contactPerson || !email || !phone) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  try {
    const company = await prisma.company.create({
      data: { name, industry, location, contactPerson, email, phone },
    });
    return NextResponse.json(company, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Company already exists" }, { status: 409 });
  }
}
