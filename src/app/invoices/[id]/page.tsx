"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
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
  Trash2,
  CreditCard,
} from "lucide-react";

const PAYMENT_METHODS = [
  "Interac e-Transfer",
  "Bank Transfer",
  "Credit Card",
  "Cash",
  "Cheque",
  "Other",
];

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Interac e-Transfer");
  const [recordingPayment, setRecordingPayment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [invoiceRes, settingsRes] = await Promise.all([
        fetch(`/api/invoices/${params.id}`),
        fetch("/api/settings"),
      ]);
      if (invoiceRes.ok) setInvoice(await invoiceRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
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
        setInvoice(await res.json());
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
        setInvoice(await res.json());
        showMessage("success", "Invoice marked as overdue");
      }
    } catch {
      showMessage("error", "Failed to update invoice");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecordPayment = async () => {
    if (!invoice) return;
    setRecordingPayment(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          paymentRef,
          paymentMethod,
          paidAt: new Date(paymentDate).toISOString(),
        }),
      });
      if (res.ok) {
        setInvoice(await res.json());
        setShowPaymentModal(false);
        showMessage("success", "Payment recorded!");
      } else {
        const err = await res.json();
        showMessage("error", err.error || "Failed to record payment");
      }
    } catch {
      showMessage("error", "Failed to record payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    const msg = invoice.status !== "draft"
      ? `This invoice is ${invoice.status}. Permanently delete it?`
      : "Delete this invoice?";
    if (!confirm(msg)) return;
    const res = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/invoices");
    } else {
      showMessage("error", "Failed to delete invoice");
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
            <h1 className="text-xl md:text-2xl font-bold text-brand-textDark">
              Edit Invoice {invoice.number}
            </h1>
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
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="text-brand-textMuted hover:text-brand-textDark transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-brand-accent">{invoice.number}</h1>
                <Badge status={invoice.status} />
              </div>
              <p className="text-xs text-brand-textMuted mt-0.5">
                Created {format(new Date(invoice.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
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
                  <span className="hidden sm:inline">{invoice.sentAt ? "Resend" : "Send"}</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Record Payment</span>
                  <span className="sm:hidden">Pay</span>
                </Button>
                {invoice.status !== "overdue" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleMarkOverdue}
                    loading={actionLoading === "overdue"}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="hidden sm:inline">Overdue</span>
                  </Button>
                )}
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <button
              onClick={handleDelete}
              className="p-2 text-brand-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete invoice"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Main Invoice Preview */}
          <div className="md:col-span-2 space-y-4">
            {/* Invoice Header */}
            <div className="bg-brand-bg rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 flex items-start justify-between">
                <div>
                  <div className="text-white text-lg font-bold">Opsora Systems</div>
                  <div className="text-brand-highlight/70 text-sm mt-1">Vancouver, BC, Canada</div>
                  {settings?.gstNumber && (
                    <div className="text-brand-highlight/50 text-xs mt-1">GST #: {settings.gstNumber}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-brand-accent text-xl font-bold tracking-widest">INVOICE</div>
                  <div className="text-brand-highlight text-sm mt-1">#{invoice.number}</div>
                </div>
              </div>
              <div className="h-0.5 bg-brand-accent" />
            </div>

            {/* Bill To & Dates */}
            <div className="bg-white rounded-xl border border-brand-border p-5 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">
                    Bill To
                  </div>
                  <div className="font-semibold text-brand-textDark">{invoice.client.name}</div>
                  {invoice.client.company && (
                    <div className="text-sm text-brand-textMuted">{invoice.client.company}</div>
                  )}
                  {invoice.client.address && (
                    <div className="text-sm text-brand-textMuted mt-1">{invoice.client.address}</div>
                  )}
                  {(invoice.client.city || invoice.client.province) && (
                    <div className="text-sm text-brand-textMuted">
                      {[invoice.client.city, invoice.client.province, invoice.client.postal].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <div className="text-sm text-brand-textMuted mt-1">{invoice.client.email}</div>
                  {invoice.client.phone && (
                    <div className="text-sm text-brand-textMuted">{invoice.client.phone}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">
                    Invoice Details
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-textMuted">Issue Date</span>
                      <span className="font-medium text-brand-textDark">
                        {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-textMuted">Due Date</span>
                      <span className={`font-medium ${invoice.status === "overdue" ? "text-red-600" : "text-brand-textDark"}`}>
                        {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-textMuted">Terms</span>
                      <span className="font-medium text-brand-textDark">{invoice.paymentTerms}</span>
                    </div>
                    {invoice.sentAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-textMuted">Sent</span>
                        <span className="font-medium text-brand-textDark">
                          {format(new Date(invoice.sentAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    {invoice.paidAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-textMuted">Paid</span>
                        <span className="font-medium text-green-600">
                          {format(new Date(invoice.paidAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    {invoice.paymentMethod && (
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-textMuted">Method</span>
                        <span className="font-medium text-brand-textDark">{invoice.paymentMethod}</span>
                      </div>
                    )}
                    {invoice.paymentRef && (
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-textMuted">Ref #</span>
                        <span className="font-medium text-brand-textDark">{invoice.paymentRef}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
              {/* Mobile line items */}
              <div className="md:hidden divide-y divide-brand-border">
                <div className="px-4 py-2 bg-brand-bg grid grid-cols-2">
                  <span className="text-xs font-semibold text-brand-highlight uppercase tracking-wider">Item</span>
                  <span className="text-xs font-semibold text-brand-highlight uppercase tracking-wider text-right">Amount</span>
                </div>
                {invoice.items.map((item, index) => (
                  <div key={item.id || index} className="px-4 py-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-brand-textDark flex-1">{item.description}</span>
                      <span className="text-sm font-semibold text-brand-textDark whitespace-nowrap">
                        {formatCAD(item.amount)}
                      </span>
                    </div>
                    <div className="text-xs text-brand-textMuted mt-0.5">
                      {item.quantity} × {formatCAD(item.unitPrice)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop line items */}
              <div className="hidden md:block">
                <div className="bg-brand-bg px-6 py-3 grid grid-cols-12 gap-2">
                  <div className="col-span-5 text-xs font-semibold text-brand-highlight uppercase tracking-wider">Description</div>
                  <div className="col-span-2 text-xs font-semibold text-brand-highlight uppercase tracking-wider text-center">Qty</div>
                  <div className="col-span-2 text-xs font-semibold text-brand-highlight uppercase tracking-wider text-right">Unit Price</div>
                  <div className="col-span-3 text-xs font-semibold text-brand-highlight uppercase tracking-wider text-right">Amount</div>
                </div>
                <div className="divide-y divide-brand-border">
                  {invoice.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className={`px-6 py-3 grid grid-cols-12 gap-2 ${index % 2 === 1 ? "bg-brand-surface2" : ""}`}
                    >
                      <div className="col-span-5 text-sm text-brand-textDark">{item.description}</div>
                      <div className="col-span-2 text-sm text-brand-textMuted text-center">{item.quantity}</div>
                      <div className="col-span-2 text-sm text-brand-textMuted text-right">{formatCAD(item.unitPrice)}</div>
                      <div className="col-span-3 text-sm font-semibold text-brand-textDark text-right">{formatCAD(item.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-white rounded-xl border border-brand-border p-5 shadow-sm">
                <div className="text-xs font-bold text-brand-accent uppercase tracking-widest mb-2">Notes</div>
                <p className="text-sm text-brand-textMuted">{invoice.notes}</p>
              </div>
            )}

            {/* Footer note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              If you are unable to make the online payment, please contact us at{" "}
              <a href="mailto:rajbarot@opsorasystems.com" className="text-brand-accent font-medium hover:underline">
                rajbarot@opsorasystems.com
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <InvoiceTotals
              subtotal={invoice.subtotal}
              discountPct={invoice.discountPct}
              gstRate={invoice.gstRate}
              readOnly
            />

            {/* Reminder History */}
            {invoice.reminders && invoice.reminders.length > 0 && (
              <div className="bg-white rounded-xl border border-brand-border p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-brand-textDark mb-3">Reminder History</h4>
                <div className="space-y-2">
                  {invoice.reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-textMuted" />
                        <span className="text-brand-textMuted">Day +{reminder.daysAfterDue}</span>
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

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        <div className="space-y-4">
          <div className="bg-brand-surface2 rounded-lg p-3 border border-brand-border">
            <div className="flex justify-between text-sm">
              <span className="text-brand-textMuted">Invoice</span>
              <span className="font-semibold text-brand-textDark">{invoice.number}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-brand-textMuted">Amount Due</span>
              <span className="font-bold text-brand-accent">{formatCAD(invoice.total)}</span>
            </div>
          </div>

          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-brand-textDark mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full text-sm border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent text-brand-textDark bg-white"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <Input
            label="Reference Number"
            placeholder="e.g., transfer ref, cheque #, transaction ID"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              loading={recordingPayment}
              onClick={handleRecordPayment}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Paid
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
