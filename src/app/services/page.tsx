"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Service } from "@/types";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  unitPrice: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Valid price required"),
});

type FormData = z.infer<typeof schema>;

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/services");
    setServices(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditService(null);
    reset({ name: "", description: "", unitPrice: "0" });
    setShowModal(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditService(service);
    reset({
      name: service.name,
      description: service.description,
      unitPrice: String(service.unitPrice),
    });
    setShowModal(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const url = editService ? `/api/services/${editService.id}` : "/api/services";
      const method = editService ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, unitPrice: parseFloat(data.unitPrice) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      showMessage("success", editService ? "Service updated!" : "Service added!");
      setShowModal(false);
      fetchServices();
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/services/${serviceId}`, { method: "DELETE" });
    if (res.ok) {
      showMessage("success", "Service deleted");
      fetchServices();
    }
  };

  const formatCAD = (amount: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-brand-textDark">
              Services Catalogue
            </h1>
            <p className="text-sm text-brand-textMuted mt-0.5">
              Manage your reusable services and pricing
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate} className="w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Add Service
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

        {/* Services List */}
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-brand-textMuted">
              <div className="animate-spin w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full mx-auto mb-3" />
              Loading...
            </div>
          ) : services.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-10 h-10 text-brand-border mx-auto mb-3" />
              <p className="text-brand-textMuted text-sm mb-3">
                No services yet. Add your first service to get started.
              </p>
              <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                <Plus className="w-4 h-4" />
                Add First Service
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="md:hidden divide-y divide-brand-border">
                {services.map((service) => (
                  <div key={service.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-brand-textDark">{service.name}</div>
                      {service.description && (
                        <div className="text-xs text-brand-textMuted truncate">{service.description}</div>
                      )}
                      <div className="text-sm font-bold text-brand-accent mt-0.5">{formatCAD(service.unitPrice)}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="p-2 text-brand-textMuted hover:text-brand-accent hover:bg-pink-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-brand-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-surface2">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">Service Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-brand-textMuted uppercase tracking-wider">Added</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-brand-textMuted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-brand-surface2 transition-colors">
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-semibold text-brand-textDark">{service.name}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-sm text-brand-textMuted">{service.description || "-"}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-semibold text-brand-accent">{formatCAD(service.unitPrice)}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-sm text-brand-textMuted">{format(new Date(service.createdAt), "MMM d, yyyy")}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(service)}
                              className="p-1.5 text-brand-textMuted hover:text-brand-accent hover:bg-pink-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(service.id)}
                              className="p-1.5 text-brand-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editService ? "Edit Service" : "Add New Service"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Service Name"
            placeholder="e.g., Web Development, Consulting"
            required
            error={errors.name?.message}
            {...register("name")}
          />
          <div>
            <label className="block text-sm font-medium text-brand-textDark mb-1.5">
              Description
            </label>
            <textarea
              {...register("description")}
              placeholder="Brief description of the service..."
              rows={2}
              className="w-full text-sm border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent text-brand-textDark placeholder-brand-textMuted resize-none"
            />
          </div>
          <Input
            label="Unit Price (CAD)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            error={errors.unitPrice?.message}
            {...register("unitPrice")}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">
              {editService ? "Save Changes" : "Add Service"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
