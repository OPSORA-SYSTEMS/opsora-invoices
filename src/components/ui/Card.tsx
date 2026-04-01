import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export default function Card({ children, className = "", title, action }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-brand-border shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
          {title && (
            <h3 className="text-base font-semibold text-brand-textDark">{title}</h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
