"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import { Settings } from "@/types";
import { LineItem } from "@/components/invoice/LineItemsEditor";

interface InvoiceFormWrapperProps {
  settings: Settings;
}

interface TemplateData {
  clientId?: number;
  items?: LineItem[];
  notes?: string;
  paymentTerms?: string;
  discountPct?: number;
}

export default function InvoiceFormWrapper({ settings }: InvoiceFormWrapperProps) {
  const searchParams = useSearchParams();
  const [initialData, setInitialData] = useState<{
    clientId?: number;
    items?: LineItem[];
    notes?: string;
    paymentTerms?: string;
    discountPct?: number;
  } | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fromTemplate = searchParams.get("from") === "template";
    if (fromTemplate) {
      const stored = sessionStorage.getItem("templateData");
      if (stored) {
        try {
          const data: TemplateData = JSON.parse(stored);
          setInitialData(data);
          sessionStorage.removeItem("templateData");
        } catch {
          // ignore
        }
      }
    }
    setReady(true);
  }, [searchParams]);

  if (!ready) return null;

  return <InvoiceForm settings={settings} initialData={initialData} />;
}
