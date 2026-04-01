"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { Service } from "@/types";

export interface LineItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  sortOrder: number;
}

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  services?: Service[];
}

export default function LineItemsEditor({
  items,
  onChange,
  services = [],
}: LineItemsEditorProps) {
  const [showServiceDropdown, setShowServiceDropdown] = useState<number | null>(null);

  const addItem = () => {
    const newItem: LineItem = {
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      sortOrder: items.length,
    };
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems.map((item, i) => ({ ...item, sortOrder: i })));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // Recalculate amount
    if (field === "quantity" || field === "unitPrice") {
      const qty = field === "quantity" ? Number(value) : item.quantity;
      const price = field === "unitPrice" ? Number(value) : item.unitPrice;
      item.amount = Math.round(qty * price * 100) / 100;
    }

    newItems[index] = item;
    onChange(newItems);
  };

  const applyService = (index: number, service: Service) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    item.description = service.name + (service.description ? ` - ${service.description}` : "");
    item.unitPrice = service.unitPrice;
    item.amount = Math.round(item.quantity * service.unitPrice * 100) / 100;
    newItems[index] = item;
    onChange(newItems);
    setShowServiceDropdown(null);
  };

  const formatCAD = (amount: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);

  return (
    <div className="space-y-2">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-2 py-1.5 text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
        <div className="col-span-5">Description</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-right">Unit Price</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1"></div>
      </div>

      {/* Items */}
      {items.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-12 gap-2 items-center bg-white border border-brand-border rounded-lg p-2"
        >
          {/* Description */}
          <div className="col-span-5 relative">
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                placeholder="Service or item description..."
                className="flex-1 text-sm border border-brand-border rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-accent text-brand-textDark placeholder-brand-textMuted"
              />
              {services.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowServiceDropdown(showServiceDropdown === index ? null : index)
                    }
                    className="p-1.5 text-brand-textMuted hover:text-brand-accent border border-brand-border rounded hover:border-brand-accent transition-colors"
                    title="Select from catalogue"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showServiceDropdown === index && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-brand-border rounded-lg shadow-lg z-20 py-1">
                      <div className="px-3 py-1.5 text-xs font-semibold text-brand-textMuted border-b border-brand-border">
                        Services Catalogue
                      </div>
                      {services.map((svc) => (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => applyService(index, svc)}
                          className="w-full text-left px-3 py-2 hover:bg-brand-surface2 transition-colors"
                        >
                          <div className="text-sm font-medium text-brand-textDark">
                            {svc.name}
                          </div>
                          <div className="text-xs text-brand-textMuted flex justify-between">
                            <span>{svc.description}</span>
                            <span className="font-semibold text-brand-accent">
                              {formatCAD(svc.unitPrice)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="col-span-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
              className="w-full text-sm border border-brand-border rounded px-2.5 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-brand-accent text-brand-textDark"
            />
          </div>

          {/* Unit Price */}
          <div className="col-span-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-brand-textMuted">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                className="w-full text-sm border border-brand-border rounded pl-5 pr-2 py-1.5 text-right focus:outline-none focus:ring-1 focus:ring-brand-accent text-brand-textDark"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="col-span-2 text-right">
            <span className="text-sm font-semibold text-brand-textDark">
              {formatCAD(item.amount)}
            </span>
          </div>

          {/* Remove */}
          <div className="col-span-1 flex justify-center">
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-1 text-brand-textMuted hover:text-red-500 transition-colors rounded hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Add Item Button */}
      <button
        type="button"
        onClick={addItem}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-brand-border rounded-lg text-sm text-brand-textMuted hover:text-brand-accent hover:border-brand-accent transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Line Item
      </button>

      {/* Close dropdown on outside click */}
      {showServiceDropdown !== null && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowServiceDropdown(null)}
        />
      )}
    </div>
  );
}
