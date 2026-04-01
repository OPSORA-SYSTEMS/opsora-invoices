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

  const client = await prisma.client.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: true },
      },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
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
  const { name, company, email, phone, address, city, province, postal, country, notes } = body;

  const clientId = parseInt(params.id);

  const existing = await prisma.client.findUnique({ where: { id: clientId } });
  if (!existing) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const client = await prisma.client.update({
    where: { id: clientId },
    data: {
      name: name ?? existing.name,
      company: company ?? existing.company,
      email: email ?? existing.email,
      phone: phone ?? existing.phone,
      address: address ?? existing.address,
      city: city ?? existing.city,
      province: province ?? existing.province,
      postal: postal ?? existing.postal,
      country: country ?? existing.country,
      notes: notes ?? existing.notes,
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = parseInt(params.id);

  const invoiceCount = await prisma.invoice.count({
    where: { clientId },
  });

  if (invoiceCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete client with existing invoices" },
      { status: 400 }
    );
  }

  await prisma.client.delete({ where: { id: clientId } });

  return NextResponse.json({ success: true });
}
