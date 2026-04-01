import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = await prisma.service.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json(service);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, unitPrice } = body;

  const serviceId = parseInt(params.id);

  const existing = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const service = await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: name ?? existing.name,
      description: description ?? existing.description,
      unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : existing.unitPrice,
    },
  });

  return NextResponse.json(service);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceId = parseInt(params.id);

  const existing = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  await prisma.service.delete({ where: { id: serviceId } });

  return NextResponse.json({ success: true });
}
