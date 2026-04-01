"use client";

import { DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface StatsCardsProps {
  totalUnpaid: number;
  totalPaid: number;
  overdueCount: number;
}

export default function StatsCards({
  totalUnpaid,
  totalPaid,
  overdueCount,
}: StatsCardsProps) {
  const formatCAD = (amount: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Unpaid */}
      <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-brand-surface2 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-brand-accent" />
          </div>
          <span className="text-xs font-medium text-brand-accent bg-pink-50 px-2 py-1 rounded-full">
            Outstanding
          </span>
        </div>
        <div className="text-2xl font-bold text-brand-textDark mb-1">
          {formatCAD(totalUnpaid)}
        </div>
        <div className="text-sm text-brand-textMuted">Total Unpaid (CAD)</div>
      </div>

      {/* Total Paid */}
      <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
            Collected
          </span>
        </div>
        <div className="text-2xl font-bold text-brand-textDark mb-1">
          {formatCAD(totalPaid)}
        </div>
        <div className="text-sm text-brand-textMuted">Total Paid (CAD)</div>
      </div>

      {/* Overdue Count */}
      <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full">
            Action Required
          </span>
        </div>
        <div className="text-2xl font-bold text-brand-textDark mb-1">
          {overdueCount}
        </div>
        <div className="text-sm text-brand-textMuted">Overdue Invoices</div>
      </div>
    </div>
  );
}
