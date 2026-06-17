"use client";

import { InputHTMLAttributes, useEffect, useState } from "react";
import { formatCurrencyString, parseCurrency } from "@/lib/format";

interface CurrencyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** The numeric value. */
  value: number;
  /** Called with the parsed numeric value on every edit. */
  onValueChange: (value: number) => void;
}

/**
 * Text input that displays a number with thousands separators while typing
 * (e.g. 500000 shows as "500,000") and reports a parsed number to the parent.
 * Keeps its own display string so partial input like "1,234." is preserved.
 */
export default function CurrencyInput({
  value,
  onValueChange,
  ...props
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(() =>
    value ? formatCurrencyString(String(value)) : ""
  );

  // Re-sync when the value is changed from outside (e.g. picking a service)
  // without clobbering in-progress typing like "1,234.".
  useEffect(() => {
    if (parseCurrency(display) !== value) {
      setDisplay(value ? formatCurrencyString(String(value)) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={display}
      onChange={(e) => {
        const formatted = formatCurrencyString(e.target.value);
        setDisplay(formatted);
        onValueChange(parseCurrency(formatted));
      }}
    />
  );
}
