import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(services);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, unitPrice } = body;

  if (!name || unitPrice === undefined) {
    return NextResponse.json(
      { error: "Name and unit price are required" },
      { status: 400 }
    );
  }

  const service = await prisma.service.create({
    data: {
      name,
      description: description || "",
      unitPrice: parseFloat(unitPrice),
    },
  });

  return NextResponse.json(service, { status: 201 });
}
