import prisma from "./prisma";

export async function generateInvoiceNumber(): Promise<string> {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  if (!settings) {
    throw new Error("Settings not found");
  }

  const year = new Date().getFullYear();
  const seq = settings.nextInvoiceSeq;
  const seqPadded = String(seq).padStart(3, "0");
  const invoiceNumber = `${settings.invoicePrefix}-${year}-${seqPadded}`;

  // Increment the sequence
  await prisma.settings.update({
    where: { id: 1 },
    data: { nextInvoiceSeq: seq + 1 },
  });

  return invoiceNumber;
}
