"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ClientForm from "@/components/client/ClientForm";
import { Client } from "@/types";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Mail, Phone, Search } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/clients?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setClients(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [fetchClients]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditClient(null);
    setShowModal(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditClient(client);
    setShowModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setSaving(true);
    try {
      const url = editClient ? `/api/clients/${editClient.id}` : "/api/clients";
      const method = editClient ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      showMessage("success", editClient ? "Client updated!" : "Client added!");
      setShowModal(false);
      fetchClients();
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId: number) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    if (res.ok) {
      showMessage("success", "Client deleted");
      fetchClients();
    } else {
      const err = await res.json();
      showMessage("error", err.error || "Failed to delete");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-brand-textDark">Clients</h1>
            <p className="text-sm text-brand-textMuted mt-0.5">
              Manage your client address book
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate} className="w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Add Client
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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-textMuted" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent bg-white text-brand-textDark placeholder-brand-textMuted"
          />
        </div>

        {/* Client Cards */}
        {loading ? (
          <div className="py-16 text-center text-brand-textMuted">
            <div className="animate-spin w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full mx-auto mb-3" />
            Loading...
          </div>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-brand-textMuted text-sm mb-3">No clients found.</p>
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4" />
              Add First Client
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl border border-brand-border p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-brand-textDark">
                      {client.name}
                    </div>
                    {client.company && (
                      <div className="text-sm text-brand-textMuted">
                        {client.company}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(client)}
                      className="p-1.5 text-brand-textMuted hover:text-brand-accent hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-1.5 text-brand-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-brand-textMuted">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <a
                      href={`mailto:${client.email}`}
                      className="hover:text-brand-accent truncate"
                    >
                      {client.email}
                    </a>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-brand-textMuted">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      {client.phone}
                    </div>
                  )}
                  {(client.city || client.province) && (
                    <div className="text-sm text-brand-textMuted">
                      {[client.city, client.province, client.country]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-brand-border">
                  <span className="text-xs text-brand-textMuted">
                    Added {format(new Date(client.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editClient ? "Edit Client" : "Add New Client"}
        size="lg"
      >
        <ClientForm
          initialData={editClient || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          loading={saving}
        />
      </Modal>
    </AppLayout>
  );
}
