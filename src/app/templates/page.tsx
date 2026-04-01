"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import LineItemsEditor, { LineItem } from "@/components/invoice/LineItemsEditor";
import { Template, Client, Service } from "@/types";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Copy, FileText } from "lucide-react";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formClientId, setFormClientId] = useState("");
  const [formItems, setFormItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0, amount: 0, sortOrder: 0 },
  ]);
  const [formNotes, setFormNotes] = useState("");
  const [formPaymentTerms, setFormPaymentTerms] = useState("Due on receipt");
  const [formDiscountPct, setFormDiscountPct] = useState("0");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [templatesRes, clientsRes, servicesRes] = await Promise.all([
      fetch("/api/templates"),
      fetch("/api/clients"),
      fetch("/api/services"),
    ]);
    setTemplates(await templatesRes.json());
    setClients(await clientsRes.json());
    setServices(await servicesRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditTemplate(null);
    setFormName("");
    setFormClientId("");
    setFormItems([{ description: "", quantity: 1, unitPrice: 0, amount: 0, sortOrder: 0 }]);
    setFormNotes("");
    setFormPaymentTerms("Due on receipt");
    setFormDiscountPct("0");
    setShowModal(true);
  };

  const handleOpenEdit = (tpl: Template) => {
    setEditTemplate(tpl);
    setFormName(tpl.name);
    setFormClientId(tpl.clientId ? String(tpl.clientId) : "");
    try {
      setFormItems(JSON.parse(tpl.items));
    } catch {
      setFormItems([]);
    }
    setFormNotes(tpl.notes);
    setFormPaymentTerms(tpl.paymentTerms);
    setFormDiscountPct(String(tpl.discountPct));
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formName) return;
    setSaving(true);
    try {
      const url = editTemplate ? `/api/templates/${editTemplate.id}` : "/api/templates";
      const method = editTemplate ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          clientId: formClientId || null,
          items: formItems,
          notes: formNotes,
          paymentTerms: formPaymentTerms,
          discountPct: parseFloat(formDiscountPct) || 0,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showMessage("success", editTemplate ? "Template updated!" : "Template created!");
      setShowModal(false);
      fetchData();
    } catch {
      showMessage("error", "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    showMessage("success", "Template deleted");
    fetchData();
  };

  const handleCreateFromTemplate = (tpl: Template) => {
    // Store template data in sessionStorage and redirect to new invoice
    const items = JSON.parse(tpl.items || "[]");
    const templateData = {
      clientId: tpl.clientId,
      items,
      notes: tpl.notes,
      paymentTerms: tpl.paymentTerms,
      discountPct: tpl.discountPct,
    };
    sessionStorage.setItem("templateData", JSON.stringify(templateData));
    router.push("/invoices/new?from=template");
  };

  const clientOptions = [
    { value: "", label: "No default client" },
    ...clients.map((c) => ({
      value: String(c.id),
      label: c.company ? `${c.name} (${c.company})` : c.name,
    })),
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-textDark">Templates</h1>
            <p className="text-sm text-brand-textMuted mt-0.5">
              Save invoice structures for quick reuse
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
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

        {/* Templates Grid */}
        {loading ? (
          <div className="py-16 text-center text-brand-textMuted">
            <div className="animate-spin w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full mx-auto mb-3" />
            Loading...
          </div>
        ) : templates.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-brand-border mx-auto mb-3" />
            <p className="text-brand-textMuted text-sm mb-3">
              No templates yet. Create one to speed up invoice creation.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4" />
              Create First Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              let itemCount = 0;
              try {
                itemCount = JSON.parse(tpl.items).length;
              } catch {}

              return (
                <div
                  key={tpl.id}
                  className="bg-white rounded-xl border border-brand-border p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-brand-textDark">
                        {tpl.name}
                      </div>
                      {tpl.client && (
                        <div className="text-sm text-brand-textMuted mt-0.5">
                          {tpl.client.name}
                          {tpl.client.company && ` · ${tpl.client.company}`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(tpl)}
                        className="p-1.5 text-brand-textMuted hover:text-brand-accent hover:bg-pink-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tpl.id)}
                        className="p-1.5 text-brand-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm text-brand-textMuted">
                    <div>{itemCount} line item{itemCount !== 1 ? "s" : ""}</div>
                    <div>Terms: {tpl.paymentTerms}</div>
                    {tpl.discountPct > 0 && (
                      <div>Discount: {tpl.discountPct}%</div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between">
                    <span className="text-xs text-brand-textMuted">
                      {format(new Date(tpl.createdAt), "MMM d, yyyy")}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCreateFromTemplate(tpl)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Use Template
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTemplate ? "Edit Template" : "Create Template"}
        size="xl"
      >
        <div className="space-y-4">
          <Input
            label="Template Name"
            placeholder="e.g., Monthly Retainer, Standard Web Dev"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <Select
            label="Default Client (optional)"
            options={clientOptions}
            value={formClientId}
            onChange={(e) => setFormClientId(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-brand-textDark mb-2">
              Line Items
            </label>
            <LineItemsEditor
              items={formItems}
              onChange={setFormItems}
              services={services}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Payment Terms"
              placeholder="Due on receipt"
              value={formPaymentTerms}
              onChange={(e) => setFormPaymentTerms(e.target.value)}
            />
            <Input
              label="Discount %"
              type="number"
              min="0"
              max="100"
              value={formDiscountPct}
              onChange={(e) => setFormDiscountPct(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-textDark mb-1.5">
              Notes
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Default notes for invoices using this template..."
              rows={3}
              className="w-full text-sm border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent text-brand-textDark placeholder-brand-textMuted resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} loading={saving} className="flex-1">
              {editTemplate ? "Save Changes" : "Create Template"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
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
