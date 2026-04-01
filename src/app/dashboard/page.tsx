import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AppLayout from "@/components/layout/AppLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Invoice } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fetch stats
  const [unpaidInvoices, paidInvoices, overdueInvoices, recentInvoices] =
    await Promise.all([
      prisma.invoice.findMany({
        where: { status: { in: ["draft", "sent"] } },
        select: { total: true },
      }),
      prisma.invoice.findMany({
        where: { status: "paid" },
        select: { total: true },
      }),
      prisma.invoice.count({
        where: { status: "overdue" },
      }),
      prisma.invoice.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          client: true,
          items: { orderBy: { sortOrder: "asc" } },
        },
      }),
    ]);

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Serialize dates
  const serializedRecentInvoices: Invoice[] = recentInvoices.map((inv) => ({
    ...inv,
    status: inv.status as Invoice["status"],
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    sentAt: inv.sentAt?.toISOString() ?? null,
    paidAt: inv.paidAt?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
    client: {
      ...inv.client,
      createdAt: inv.client.createdAt.toISOString(),
    },
    items: inv.items.map((item) => ({ ...item })),
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-textDark">Dashboard</h1>
            <p className="text-sm text-brand-textMuted mt-0.5">
              Welcome back. Here&apos;s an overview of your invoices.
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 bg-brand-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors shadow-sm shadow-brand-accent/25"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </Link>
        </div>

        {/* Stats */}
        <StatsCards
          totalUnpaid={totalUnpaid}
          totalPaid={totalPaid}
          overdueCount={overdueInvoices}
        />

        {/* Recent Invoices */}
        <RecentInvoices invoices={serializedRecentInvoices} />
      </div>
    </AppLayout>
  );
}
