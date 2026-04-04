"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Invoice, InvoiceFilter } from "@/types";
import { format } from "date-fns";
import { Plus, Download, Send, Eye, Trash2 } from "lucide-react";

const filters: { value: InvoiceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<number | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/invoices?filter=${filter}`);
    const data = await res.json();
    setInvoices(data.invoices || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDownloadPDF = (invoiceId: number, invoiceNumber: string) => {
    const link = document.createElement("a");
    link.href = `/api/invoices/${invoiceId}/pdf`;
    link.download = `Invoice-${invoiceNumber}.pdf`;
    link.click();
  };

  const handleSend = async (invoiceId: number) => {
    setSending(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
      if (res.ok) {
        fetchInvoices();
      } else {
        const err = await res.json();
        alert(`Failed to send: ${err.error}`);
      }
    } catch {
      alert("Failed to send invoice");
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (invoiceId: number, status: string) => {
    const msg = status !== "draft"
      ? `This invoice is ${status}. Permanently delete it?`
      : "Delete this invoice?";
    if (!confirm(msg)) return;
    const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
    if (res.ok) fetchInvoices();
  };

  const formatCAD = (amount: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-brand-textDark">Invoices</h1>
            <p className="text-sm text-brand-textMuted mt-0.5">
              Manage and track all your invoices
            </p>
          </div>
          <Link href="/invoices/new" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              New Invoice
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1 bg-white border border-brand-border rounded-lg p-1 shadow-sm">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === f.value
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-brand-textMuted hover:text-brand-textDark hover:bg-brand-surface2"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-brand-textMuted">
              <div className="animate-spin w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full mx-auto mb-3" />
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-brand-textMuted text-sm mb-3">
                No {filter !== "all" ? filter : ""} invoices found.
              </p>
              <Link href="/invoices/new">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          ) : (
            <>
            {/* Mobile card view */}
            <div className="md:hidden divide-y divide-brand-border">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/invoices/${invoice.id}`} className="text-sm font-bold text-brand-accent">
                      {invoice.number}
                    </Link>
                    <Badge status={invoice.status} />
                  </div>
                  <div className="text-sm font-medium text-brand-textDark">{invoice.client.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-brand-textMuted">Due {format(new Date(invoice.dueDate), "MMM d, yyyy")}</span>
                    <span className="text-sm font-bold text-brand-textDark">{formatCAD(invoice.total)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => router.push(`/invoices/${invoice.id}`)} className="flex-1 py-1.5 text-xs font-medium border border-brand-border rounded-lg text-brand-textMuted hover:text-brand-accent">View</button>
                    <button onClick={() => router.push(`/invoices/${invoice.id}?edit=1`)} className="flex-1 py-1.5 text-xs font-medium border border-brand-border rounded-lg text-brand-textMuted hover:text-brand-accent">Edit</button>
                    <button onClick={() => handleDownloadPDF(invoice.id, invoice.number)} className="flex-1 py-1.5 text-xs font-medium border border-brand-border rounded-lg text-brand-textMuted hover:text-brand-accent">PDF</button>
                    {invoice.status !== "paid" && (
                      <button onClick={() => handleSend(invoice.id)} disabled={sending === invoice.id} className="flex-1 py-1.5 text-xs font-medium border border-brand-border rounded-lg text-brand-textMuted hover:text-blue-600 disabled:opacity-50">
                        {sending === invoice.id ? "..." : "Send"}
                      </button>
                    )}
                    <button onClick={() => handleDelete(invoice.id, invoice.status)} className="flex-1 py-1.5 text-xs font-medium border border-red-200 rounded-lg text-red-400 hover:text-red-600">Del</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-surface2">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className={`hover:bg-brand-surface2 transition-colors ${
                        invoice.status === "overdue" ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="px-6 py-3.5">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-sm font-bold text-brand-accent hover:text-pink-700"
                        >
                          {invoice.number}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="text-sm font-medium text-brand-textDark">
                          {invoice.client.name}
                        </div>
                        {invoice.client.company && (
                          <div className="text-xs text-brand-textMuted">
                            {invoice.client.company}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-brand-textMuted">
                        {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`text-sm ${
                            invoice.status === "overdue"
                              ? "text-red-600 font-medium"
                              : "text-brand-textMuted"
                          }`}
                        >
                          {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                        </span>
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
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/invoices/${invoice.id}`)}
                            className="p-1.5 text-brand-textMuted hover:text-brand-accent hover:bg-pink-50 rounded-lg transition-colors"
                            title="View invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(invoice.id, invoice.number)}
                            className="p-1.5 text-brand-textMuted hover:text-brand-accent hover:bg-pink-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {invoice.status !== "paid" && (
                            <button
                              onClick={() => handleSend(invoice.id)}
                              disabled={sending === invoice.id}
                              className="p-1.5 text-brand-textMuted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Send invoice"
                            >
                              {sending === invoice.id ? (
                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(invoice.id, invoice.status)}
                            className="p-1.5 text-brand-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
