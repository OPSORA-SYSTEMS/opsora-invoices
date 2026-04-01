import { InvoiceStatus } from "@/types";

interface BadgeProps {
  status: InvoiceStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  draft: {
    label: "Draft",
    classes: "bg-gray-100 text-gray-700 border border-gray-200",
  },
  sent: {
    label: "Sent",
    classes: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  paid: {
    label: "Paid",
    classes: "bg-green-50 text-green-700 border border-green-200",
  },
  overdue: {
    label: "Overdue",
    classes: "bg-red-50 text-red-700 border border-red-200",
  },
};

export default function Badge({ status, className = "" }: BadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    classes: "bg-gray-100 text-gray-700 border border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}
