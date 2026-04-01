import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.template.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, clientId, items, notes, paymentTerms, discountPct } = body;

  if (!name || !items) {
    return NextResponse.json(
      { error: "Name and items are required" },
      { status: 400 }
    );
  }

  const template = await prisma.template.create({
    data: {
      name,
      clientId: clientId ? parseInt(clientId) : null,
      items: typeof items === "string" ? items : JSON.stringify(items),
      notes: notes || "",
      paymentTerms: paymentTerms || "Due on receipt",
      discountPct: discountPct || 0,
    },
    include: { client: true },
  });

  return NextResponse.json(template, { status: 201 });
}
