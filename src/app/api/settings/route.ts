import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { testSMTPConnection } from "@/lib/email";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let settings = await prisma.settings.findUnique({ where: { id: 1 } });

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 1 },
    });
  }

  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    companyName,
    companyEmail,
    companyAddress,
    companyCity,
    companyProvince,
    companyPostal,
    companyCountry,
    gstNumber,
    gstRate,
    invoicePrefix,
    paymentTerms,
    logoPath,
    emailSignature,
    reminderDays,
  } = body;

  const updateData: Record<string, unknown> = {};

  if (companyName !== undefined) updateData.companyName = companyName;
  if (companyEmail !== undefined) updateData.companyEmail = companyEmail;
  if (companyAddress !== undefined) updateData.companyAddress = companyAddress;
  if (companyCity !== undefined) updateData.companyCity = companyCity;
  if (companyProvince !== undefined) updateData.companyProvince = companyProvince;
  if (companyPostal !== undefined) updateData.companyPostal = companyPostal;
  if (companyCountry !== undefined) updateData.companyCountry = companyCountry;
  if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
  if (gstRate !== undefined) updateData.gstRate = parseFloat(gstRate);
  if (invoicePrefix !== undefined) updateData.invoicePrefix = invoicePrefix;
  if (paymentTerms !== undefined) updateData.paymentTerms = paymentTerms;
  if (logoPath !== undefined) updateData.logoPath = logoPath;
  if (emailSignature !== undefined) updateData.emailSignature = emailSignature;
  if (reminderDays !== undefined) updateData.reminderDays = reminderDays;

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: updateData,
    create: { id: 1, ...updateData },
  });

  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === "test-smtp") {
    const result = await testSMTPConnection();
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
