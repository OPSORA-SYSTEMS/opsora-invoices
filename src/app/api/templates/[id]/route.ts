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

  const template = await prisma.template.findUnique({
    where: { id: parseInt(params.id) },
    include: { client: true },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json(template);
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
  const { name, clientId, items, notes, paymentTerms, discountPct } = body;

  const templateId = parseInt(params.id);

  const existing = await prisma.template.findUnique({ where: { id: templateId } });
  if (!existing) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const template = await prisma.template.update({
    where: { id: templateId },
    data: {
      name: name ?? existing.name,
      clientId: clientId !== undefined ? (clientId ? parseInt(clientId) : null) : existing.clientId,
      items: items !== undefined ? (typeof items === "string" ? items : JSON.stringify(items)) : existing.items,
      notes: notes ?? existing.notes,
      paymentTerms: paymentTerms ?? existing.paymentTerms,
      discountPct: discountPct ?? existing.discountPct,
    },
    include: { client: true },
  });

  return NextResponse.json(template);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templateId = parseInt(params.id);

  const existing = await prisma.template.findUnique({ where: { id: templateId } });
  if (!existing) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  await prisma.template.delete({ where: { id: templateId } });

  return NextResponse.json({ success: true });
}
