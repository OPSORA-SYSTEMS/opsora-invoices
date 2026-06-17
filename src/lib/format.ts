// Shared number / currency formatting helpers.

/** Add thousands separators ("brackets") to an integer string, e.g. "500000" -> "500,000". */
function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format a raw user-typed string into a grouped currency string as they type.
 * Keeps at most one decimal point and two decimal places.
 *   "500000"   -> "500,000"
 *   "1234.5"   -> "1,234.5"
 *   "1000.999" -> "1,000.99"
 */
export function formatCurrencyString(raw: string): string {
  // Keep digits and dots only.
  let cleaned = raw.replace(/[^\d.]/g, "");

  // Collapse to a single decimal point (first one wins).
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) +
      cleaned.slice(firstDot + 1).replace(/\./g, "");
  }

  const hasDot = cleaned.includes(".");
  let [intPart, decPart = ""] = cleaned.split(".");

  // Strip leading zeros but keep a single leading zero (e.g. "007" -> "7", "" stays "").
  intPart = intPart.replace(/^0+(?=\d)/, "");

  const grouped = intPart === "" ? "" : groupThousands(intPart);

  if (hasDot) {
    const safeInt = grouped === "" ? "0" : grouped;
    return `${safeInt}.${decPart.slice(0, 2)}`;
  }
  return grouped;
}

/** Parse a grouped/typed currency string back into a number. Returns 0 for empty/invalid. */
export function parseCurrency(raw: string): number {
  const n = parseFloat(String(raw).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

/** Canonical CAD currency display, e.g. 500000 -> "$500,000.00". */
export function formatCAD(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}
