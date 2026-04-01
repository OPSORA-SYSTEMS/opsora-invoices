"use client";

interface InvoiceTotalsProps {
  subtotal: number;
  discountPct: number;
  gstRate: number;
  onDiscountChange?: (val: number) => void;
  onGstRateChange?: (val: number) => void;
  readOnly?: boolean;
}

export default function InvoiceTotals({
  subtotal,
  discountPct,
  gstRate,
  onDiscountChange,
  onGstRateChange,
  readOnly = false,
}: InvoiceTotalsProps) {
  const discountAmt = subtotal * (discountPct / 100);
  const afterDiscount = subtotal - discountAmt;
  const gstAmt = afterDiscount * (gstRate / 100);
  const total = afterDiscount + gstAmt;

  const formatCAD = (amount: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);

  return (
    <div className="bg-white rounded-xl border border-brand-border p-5 space-y-3">
      <h4 className="text-sm font-semibold text-brand-textDark mb-4">
        Invoice Summary
      </h4>

      <div className="flex justify-between items-center">
        <span className="text-sm text-brand-textMuted">Subtotal</span>
        <span className="text-sm font-medium text-brand-textDark">
          {formatCAD(subtotal)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-brand-textMuted">Discount</span>
          {!readOnly && (
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={discountPct}
                onChange={(e) => onDiscountChange?.(parseFloat(e.target.value) || 0)}
                className="w-14 text-xs border border-brand-border rounded px-1.5 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
              <span className="text-xs text-brand-textMuted ml-1">%</span>
            </div>
          )}
          {readOnly && discountPct > 0 && (
            <span className="text-xs text-brand-textMuted">({discountPct}%)</span>
          )}
        </div>
        <span className="text-sm font-medium text-green-600">
          {discountAmt > 0 ? `-${formatCAD(discountAmt)}` : formatCAD(0)}
        </span>
      </div>

      {discountPct > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-brand-textMuted">After Discount</span>
          <span className="text-sm font-medium text-brand-textDark">
            {formatCAD(afterDiscount)}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-brand-textMuted">GST</span>
          {!readOnly && (
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={gstRate}
                onChange={(e) => onGstRateChange?.(parseFloat(e.target.value) || 0)}
                className="w-14 text-xs border border-brand-border rounded px-1.5 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
              <span className="text-xs text-brand-textMuted ml-1">%</span>
            </div>
          )}
          {readOnly && (
            <span className="text-xs text-brand-textMuted">({gstRate}%)</span>
          )}
        </div>
        <span className="text-sm font-medium text-brand-textDark">
          {formatCAD(gstAmt)}
        </span>
      </div>

      <div className="pt-3 border-t border-brand-border">
        <div className="flex justify-between items-center bg-brand-bg rounded-lg px-4 py-3">
          <span className="text-sm font-bold text-brand-highlight">
            Total (CAD)
          </span>
          <span className="text-xl font-bold text-brand-accent">
            {formatCAD(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
