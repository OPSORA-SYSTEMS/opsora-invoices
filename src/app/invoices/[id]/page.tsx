"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import InvoiceTotals from "@/components/invoice/InvoiceTotals";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import { Invoice, Settings } from "@/types";
import { format } from "date-fns";
import {
  Download,
  Send,
  CheckCircle,
  AlertTriangle,
  Edit,
  ArrowLeft,
  Clock,
} from "lucide-react";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [invoiceRes, settingsRes] = await Promise.all([
        fetch(`/api/invoices/${params.id}`),
        fetch("/api/settings"),
      ]);
      if (invoiceRes.ok) {
        setInvoice(await invoiceRes.json());
      }
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;
    const link = document.createElement("a");
    link.href = `/api/invoices/${invoice.id}/pdf`;
    link.download = `Invoice-${invoice.number}.pdf`;
    link.click();
  };

  const handleSend = async () => {
    if (!invoice) return;
    setActionLoading("send");
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setInvoice(updated);
        showMessage("success", "Invoice sent successfully!");
      } else {
        const err = await res.json();
        showMessage("error", err.error || "Failed to send invoice");
      }
    } catch {
      showMessage("error", "Failed to send invoice");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async () => {
    if (!invoice) return;
    if (!confirm("Mark this invoice as paid?")) return;
    setActionLoading("paid");
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoice(updated);
        showMessage("success", "Invoice marked as paid!");
      }
    } catch {
      showMessage("error", "Failed to update invoice");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkOverdue = async () => {
    if (!invoice) return;
    setActionLoading("overdue");
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "overdue" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInvoice(updated);
        showMessage("success", "Invoice marked as overdue");
      }
    } catch {
      showMessage("error", "Failed to update invoice");
    } finally {
      setActionLoading(null);
    }
  };

  const formatCAD = (amount: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="text-center py-24">
          <p className="text-brand-textMuted">Invoice not found</p>
          <Link href="/invoices" className="text-brand-accent mt-2 inline-block hover:underline">
            Back to invoices
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (editing && settings) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditing(false)}
              className="text-brand-textMuted hover:text-brand-textDark transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-brand-textDark">
                Edit Invoice {invoice.number}
              </h1>
            </div>
          </div>
          <InvoiceForm
            settings={settings}
            initialData={{
              id: invoice.id,
              clientId: invoice.clientId,
              status: invoice.status,
              issueDate: invoice.issueDate,
              dueDate: invoice.dueDate,
              paymentTerms: invoice.paymentTerms,
              notes: invoice.notes,
              items: invoice.items,
              discountPct: invoice.discountPct,
              gstRate: invoice.gstRate,
            }}
            onSave={(updated) => {
              setInvoice(updated as unknown as Invoice);
              setEditing(false);
              showMessage("success", "Invoice saved successfully!");
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="text-brand-textMuted hover:text-brand-textDark transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-brand-accent">
                  {invoice.number}
                </h1>
                <Badge status={invoice.status} />
              </div>
              <p className="text-sm text-brand-textMuted mt-0.5">
                Created {format(new Date(invoice.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            {invoice.status !== "paid" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSend}
                  loading={actionLoading === "send"}
                >
                  <Send className="w-4 h-4" />
                  {invoice.sentAt ? "Resend" : "Send Email"}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkPaid}
                  loading={actionLoading === "paid"}
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Paid
                </Button>
                {invoice.status !== "overdue" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleMarkOverdue}
                    loading={actionLoading === "overdue"}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Mark Overdue
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Main Invoice Preview */}
          <div className="col-span-2 space-y-4">
            {/* Invoice Header */}
            <div className="bg-brand-bg rounded-xl overflow-hidden shadow-sm">
              <div className="px-8 py-6 flex items-start justify-between">
                <div>
                  <div className="text-white text-xl font-bold">Opsora Systems</div>
                  <div className="text-brand-highlight/70 text-sm mt-1">
                    Vancouver, BC, Canada
                  </div>
                  {settings?.gstNumber && (
                    <div className="text-brand-highlight/50 text-xs mt-1">
                      GST #: {settings.gstNumber}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-brand-accent text-2xl font-bold tracking-widest">
                    INVOICE
                  </div>
                  <div className="text-brand-highlight text-sm mt-1">
                    #{invoice.number}
                  </div>
                </div>
              </div>
              <div className="h-0.5 bg-brand-accent" />
            </div>

            {/* Bill To & Dates */}
            <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-3">
                    Bill To
                  </div>
                  <div className="font-semibold text-brand-textDark">
                    {invoice.client.name}
                  </div>
                  {invoice.client.company && (
                    <div className="text-sm text-brand-textMuted">
                      {invoice.client.company}
                    </div>
                  )}
                  {invoice.client.address && (
                    <div className="text-sm text-brand-textMuted mt-1">
                      {invoice.client.address}
                    </div>
                  )}
                  {(invoice.client.city || invoice.client.province) && (
                    <div className="text-sm text-brand-textMuted">
                      {[invoice.client.city, invoice.client.province, invoice.client.postal]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                  <div className="text-sm text-brand-textMuted mt-1">
                    {invoice.client.email}
                  </div>
                  {invoice.client.phone && (
                    <div className="text-sm text-brand-textMuted">
                      {invoice.client.phone}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-3">
                    Invoice Details
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-brand-textMuted">Issue Date</span>
                      <span className="text-sm font-medium text-brand-textDark">
                        {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-brand-textMuted">Due Date</span>
                      <span className={`text-sm font-medium ${invoice.status === "overdue" ? "text-red-600" : "text-brand-textDark"}`}>
                        {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-brand-textMuted">Payment Terms</span>
                      <span className="text-sm font-medium text-brand-textDark">
                        {invoice.paymentTerms}
                      </span>
                    </div>
                    {invoice.sentAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-brand-textMuted">Sent At</span>
                        <span className="text-sm font-medium text-brand-textDark">
                          {format(new Date(invoice.sentAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    {invoice.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-brand-textMuted">Paid At</span>
                        <span className="text-sm font-medium text-green-600">
                          {format(new Date(invoice.paidAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
              <div className="bg-brand-bg px-6 py-3 grid grid-cols-12 gap-2">
                <div className="col-span-5 text-xs font-semibold text-brand-highlight uppercase tracking-wider">
                  Description
                </div>
                <div className="col-span-2 text-xs font-semibold text-brand-highlight uppercase tracking-wider text-center">
                  Qty
                </div>
                <div className="col-span-2 text-xs font-semibold text-brand-highlight uppercase tracking-wider text-right">
                  Unit Price
                </div>
                <div className="col-span-3 text-xs font-semibold text-brand-highlight uppercase tracking-wider text-right">
                  Amount
                </div>
              </div>
              <div className="divide-y divide-brand-border">
                {invoice.items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`px-6 py-3 grid grid-cols-12 gap-2 ${index % 2 === 1 ? "bg-brand-surface2" : ""}`}
                  >
                    <div className="col-span-5 text-sm text-brand-textDark">
                      {item.description}
                    </div>
                    <div className="col-span-2 text-sm text-brand-textMuted text-center">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-sm text-brand-textMuted text-right">
                      {formatCAD(item.unitPrice)}
                    </div>
                    <div className="col-span-3 text-sm font-semibold text-brand-textDark text-right">
                      {formatCAD(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm">
                <div className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">
                  Notes
                </div>
                <p className="text-sm text-brand-textMuted">{invoice.notes}</p>
              </div>
            )}

            {/* Footer note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              If you are unable to make the online payment, please contact us at{" "}
              <a
                href="mailto:rajbarot@opsorasystems.com"
                className="text-brand-accent font-medium hover:underline"
              >
                rajbarot@opsorasystems.com
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Totals */}
            <InvoiceTotals
              subtotal={invoice.subtotal}
              discountPct={invoice.discountPct}
              gstRate={invoice.gstRate}
              readOnly
            />

            {/* Reminder Schedule */}
            {invoice.reminders && invoice.reminders.length > 0 && (
              <div className="bg-white rounded-xl border border-brand-border p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-brand-textDark mb-3">
                  Reminder History
                </h4>
                <div className="space-y-2">
                  {invoice.reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-textMuted" />
                        <span className="text-brand-textMuted">
                          Day +{reminder.daysAfterDue}
                        </span>
                      </div>
                      {reminder.sentAt ? (
                        <span className="text-green-600 text-xs font-medium">
                          Sent {format(new Date(reminder.sentAt), "MMM d")}
                        </span>
                      ) : (
                        <span className="text-brand-textMuted text-xs">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
