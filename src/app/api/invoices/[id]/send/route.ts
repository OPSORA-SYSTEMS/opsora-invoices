import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/pdf";
import { sendInvoiceEmail } from "@/lib/email";
import { Invoice } from "@/types";

export async function POST(
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
      reminders: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const logoUrl = settings?.logoPath
    ? `${baseUrl}${settings.logoPath}`
    : `${baseUrl}/logo.png`;

  const invoiceForEmail: Invoice = {
    ...invoice,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    sentAt: invoice.sentAt?.toISOString() ?? null,
    paidAt: invoice.paidAt?.toISOString() ?? null,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    status: invoice.status as Invoice["status"],
    client: {
      ...invoice.client,
      createdAt: invoice.client.createdAt.toISOString(),
    },
    items: invoice.items.map((item) => ({ ...item })),
    reminders: invoice.reminders.map((r) => ({
      ...r,
      scheduledAt: r.scheduledAt.toISOString(),
      sentAt: r.sentAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  try {
    const pdfBuffer = await generateInvoicePDF(invoiceForEmail, logoUrl, settings?.gstNumber ?? null);
    await sendInvoiceEmail(invoiceForEmail, pdfBuffer);
  } catch (err) {
    console.error("Failed to send invoice email:", err);
    return NextResponse.json(
      { error: "Failed to send email. Please check your email configuration." },
      { status: 500 }
    );
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      sentAt: new Date(),
      status: invoice.status === "draft" ? "sent" : invoice.status,
    },
    include: {
      client: true,
      items: { orderBy: { sortOrder: "asc" } },
      reminders: true,
    },
  });

  return NextResponse.json(updatedInvoice);
}
