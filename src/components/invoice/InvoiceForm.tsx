"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import LineItemsEditor, { LineItem } from "./LineItemsEditor";
import InvoiceTotals from "./InvoiceTotals";
import { Client, Service, Settings } from "@/types";

const schema = z.object({
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  paymentTerms: z.string().min(1, "Payment terms required"),
  notes: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
});

type FormData = z.infer<typeof schema>;

interface InvoiceFormProps {
  settings: Settings;
  initialData?: {
    id?: number;
    clientId?: number;
    status?: string;
    issueDate?: string;
    dueDate?: string;
    paymentTerms?: string;
    notes?: string;
    items?: LineItem[];
    discountPct?: number;
    gstRate?: number;
  };
}

export default function InvoiceForm({ settings, initialData }: InvoiceFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items || [{ description: "", quantity: 1, unitPrice: 0, amount: 0, sortOrder: 0 }]
  );
  const [discountPct, setDiscountPct] = useState(initialData?.discountPct || 0);
  const [gstRate, setGstRate] = useState(initialData?.gstRate || settings.gstRate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: initialData?.clientId ? String(initialData.clientId) : "",
      issueDate: initialData?.issueDate
        ? format(new Date(initialData.issueDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      dueDate: initialData?.dueDate
        ? format(new Date(initialData.dueDate), "yyyy-MM-dd")
        : "",
      paymentTerms: initialData?.paymentTerms || settings.paymentTerms,
      notes: initialData?.notes || "",
      status: (initialData?.status as FormData["status"]) || "draft",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const [clientsRes, servicesRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/services"),
      ]);
      const [clientsData, servicesData] = await Promise.all([
        clientsRes.json(),
        servicesRes.json(),
      ]);
      setClients(clientsData);
      setServices(servicesData);
    };
    fetchData();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  const onSubmit = async (data: FormData) => {
    if (items.length === 0 || items.every((i) => !i.description)) {
      setError("Please add at least one line item");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...data,
      clientId: parseInt(data.clientId),
      issueDate: new Date(data.issueDate).toISOString(),
      dueDate: new Date(data.dueDate).toISOString(),
      discountPct,
      gstRate,
      items: items.filter((i) => i.description).map((item, idx) => ({
        ...item,
        sortOrder: idx,
      })),
    };

    try {
      const url = initialData?.id ? `/api/invoices/${initialData.id}` : "/api/invoices";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save invoice");
      }

      const invoice = await res.json();
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const clientOptions = clients.map((c) => ({
    value: String(c.id),
    label: c.company ? `${c.name} (${c.company})` : c.name,
  }));

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Client & Dates */}
          <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-brand-textDark mb-4">
              Invoice Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Select
                  label="Client"
                  options={clientOptions}
                  placeholder="Select a client..."
                  required
                  error={errors.clientId?.message}
                  {...register("clientId")}
                />
              </div>
              <Input
                label="Issue Date"
                type="date"
                required
                error={errors.issueDate?.message}
                {...register("issueDate")}
              />
              <Input
                label="Due Date"
                type="date"
                required
                error={errors.dueDate?.message}
                {...register("dueDate")}
              />
              <div className="col-span-2">
                <Input
                  label="Payment Terms"
                  placeholder="e.g., Due on receipt, Net 30"
                  error={errors.paymentTerms?.message}
                  {...register("paymentTerms")}
                />
              </div>
              {initialData?.id && (
                <div className="col-span-2">
                  <Select
                    label="Status"
                    options={statusOptions}
                    {...register("status")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-brand-textDark mb-4">
              Line Items
            </h3>
            <LineItemsEditor
              items={items}
              onChange={setItems}
              services={services}
            />
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-brand-textDark mb-4">
              Notes
            </h3>
            <textarea
              {...register("notes")}
              placeholder="Additional notes, payment instructions, or special terms..."
              rows={3}
              className="w-full text-sm border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent text-brand-textDark placeholder-brand-textMuted resize-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <InvoiceTotals
            subtotal={subtotal}
            discountPct={discountPct}
            gstRate={gstRate}
            onDiscountChange={setDiscountPct}
            onGstRateChange={setGstRate}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              className="w-full"
            >
              {initialData?.id ? "Save Changes" : "Create Invoice"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>

          {clients.length === 0 && (
            <div className="text-xs text-brand-textMuted bg-brand-surface2 rounded-lg p-3 border border-brand-border">
              No clients found.{" "}
              <a href="/clients" className="text-brand-accent hover:underline">
                Add a client
              </a>{" "}
              to get started.
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
