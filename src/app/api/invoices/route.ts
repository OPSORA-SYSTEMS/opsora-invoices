import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice-number";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  let where: Record<string, unknown> = {};

  if (filter === "unpaid") {
    where = { status: { in: ["draft", "sent"] } };
  } else if (filter === "paid") {
    where = { status: "paid" };
  } else if (filter === "overdue") {
    where = { status: "overdue" };
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        client: true,
        items: { orderBy: { sortOrder: "asc" } },
        reminders: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({ invoices, total, page, limit });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    clientId,
    status,
    issueDate,
    dueDate,
    discountPct,
    gstRate,
    paymentTerms,
    notes,
    items,
  } = body;

  if (!clientId || !dueDate || !items || items.length === 0) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Calculate totals
  const subtotal = items.reduce(
    (sum: number, item: { amount: number }) => sum + item.amount,
    0
  );
  const rate = gstRate ?? 5.0;
  const discount = discountPct ?? 0;
  const discountAmt = subtotal * (discount / 100);
  const afterDiscount = subtotal - discountAmt;
  const gstAmt = afterDiscount * (rate / 100);
  const total = afterDiscount + gstAmt;

  // Generate invoice number
  const number = await generateInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      number,
      clientId: parseInt(clientId),
      status: status || "draft",
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: new Date(dueDate),
      subtotal,
      discountPct: discount,
      discountAmt,
      gstRate: rate,
      gstAmt,
      total,
      paymentTerms: paymentTerms || "Due on receipt",
      notes: notes || "",
      items: {
        create: items.map(
          (
            item: {
              description: string;
              quantity: number;
              unitPrice: number;
              amount: number;
              sortOrder?: number;
            },
            index: number
          ) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            sortOrder: item.sortOrder ?? index,
          })
        ),
      },
    },
    include: {
      client: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
