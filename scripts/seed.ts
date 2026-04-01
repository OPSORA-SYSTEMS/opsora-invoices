import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create settings if not exists
  const existing = await prisma.settings.findUnique({ where: { id: 1 } });

  if (!existing) {
    await prisma.settings.create({
      data: {
        id: 1,
        companyName: "Opsora Systems",
        companyEmail: "rajbarot@opsorastystems.com",
        companyAddress: "",
        companyCity: "Vancouver",
        companyProvince: "BC",
        companyPostal: "",
        companyCountry: "Canada",
        gstNumber: "",
        gstRate: 5.0,
        invoicePrefix: "OPS",
        paymentTerms: "Due on receipt",
        logoPath: "",
        emailSignature: "",
        reminderDays: "1,2,3",
        nextInvoiceSeq: 1,
      },
    });
    console.log("Settings row created (id=1)");
  } else {
    console.log("Settings already exists, skipping.");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
