import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AppLayout from "@/components/layout/AppLayout";
import InvoiceFormWrapper from "./InvoiceFormWrapper";
import { Settings } from "@/types";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 1 } });
  }

  const serializedSettings: Settings = {
    ...settings,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-brand-textDark">New Invoice</h1>
          <p className="text-sm text-brand-textMuted mt-0.5">
            Create a new invoice for your client
          </p>
        </div>

        <InvoiceFormWrapper settings={serializedSettings} />
      </div>
    </AppLayout>
  );
}
