"use client";

import Link from "next/link";
import { Invoice } from "@/types";
import Badge from "@/components/ui/Badge";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

interface RecentInvoicesProps {
  invoices: Invoice[];
}

export default function RecentInvoices({ invoices }: RecentInvoicesProps) {
  const formatCAD = (amount: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);

  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
        <h3 className="text-base font-semibold text-brand-textDark">
          Recent Invoices
        </h3>
        <Link
          href="/invoices"
          className="text-sm text-brand-accent hover:text-pink-700 font-medium flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-brand-textMuted text-sm">No invoices yet.</p>
          <Link
            href="/invoices/new"
            className="text-brand-accent hover:text-pink-700 text-sm font-medium mt-2 inline-block"
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-brand-surface2 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-semibold text-brand-accent">
                      {invoice.number}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="text-sm text-brand-textDark font-medium">
                      {invoice.client.name}
                    </div>
                    {invoice.client.company && (
                      <div className="text-xs text-brand-textMuted">
                        {invoice.client.company}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-semibold text-brand-textDark">
                      {formatCAD(invoice.total)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge status={invoice.status} />
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-brand-textMuted">
                      {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-brand-accent hover:text-pink-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
