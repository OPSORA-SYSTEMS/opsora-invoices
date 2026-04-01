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

  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      client: true,
      items: { orderBy: { sortOrder: "asc" } },
      reminders: { orderBy: { daysAfterDue: "asc" } },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(invoice);
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

  const invoiceId = parseInt(params.id);

  const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!existing) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  let updateData: Record<string, unknown> = {};

  if (status !== undefined) updateData.status = status;
  if (clientId !== undefined) updateData.clientId = parseInt(clientId);
  if (issueDate !== undefined) updateData.issueDate = new Date(issueDate);
  if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
  if (paymentTerms !== undefined) updateData.paymentTerms = paymentTerms;
  if (notes !== undefined) updateData.notes = notes;

  if (status === "paid") {
    updateData.paidAt = new Date();
  }

  if (items !== undefined) {
    // Recalculate totals
    const subtotal = items.reduce(
      (sum: number, item: { amount: number }) => sum + item.amount,
      0
    );
    const rate = gstRate ?? existing.gstRate;
    const discount = discountPct ?? existing.discountPct;
    const discountAmt = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmt;
    const gstAmt = afterDiscount * (rate / 100);
    const total = afterDiscount + gstAmt;

    updateData = {
      ...updateData,
      subtotal,
      discountPct: discount,
      discountAmt,
      gstRate: rate,
      gstAmt,
      total,
    };
  } else if (discountPct !== undefined || gstRate !== undefined) {
    // Recalculate without changing items
    const currentItems = await prisma.invoiceItem.findMany({
      where: { invoiceId },
    });
    const subtotal = currentItems.reduce((sum, item) => sum + item.amount, 0);
    const rate = gstRate ?? existing.gstRate;
    const discount = discountPct ?? existing.discountPct;
    const discountAmt = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmt;
    const gstAmt = afterDiscount * (rate / 100);
    const total = afterDiscount + gstAmt;

    updateData = {
      ...updateData,
      subtotal,
      discountPct: discount,
      discountAmt,
      gstRate: rate,
      gstAmt,
      total,
    };
  }

  if (items !== undefined) {
    // Delete and recreate items
    await prisma.invoiceItem.deleteMany({ where: { invoiceId } });

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...updateData,
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
        reminders: true,
      },
    });

    return NextResponse.json(invoice);
  }

  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: updateData,
    include: {
      client: true,
      items: { orderBy: { sortOrder: "asc" } },
      reminders: true,
    },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoiceId = parseInt(params.id);

  const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!existing) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  await prisma.invoice.delete({ where: { id: invoiceId } });

  return NextResponse.json({ success: true });
}
