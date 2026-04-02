import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Image,
} from "@react-pdf/renderer";
import { Invoice } from "@/types";
import { format } from "date-fns";

const PINK = "#e91e8c";
const DARK = "#1a0a2e";
const HEADER_BG = "#0d0018";   // matches logo corner/edge dark gradient
const LIGHT_PINK_BG = "#fdf2f8";
const BORDER = "#f0e0ee";
const MUTED = "#9ca3af";
const TEXT = "#374151";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
    flexDirection: "column",
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    backgroundColor: HEADER_BG,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 36,
    paddingVertical: 0,
    marginBottom: 0,
  },
  logo: {
    width: 110,
    height: 110,
  },
  companyTextBlock: {
    flexDirection: "column",
  },
  companyName: {
    color: DARK,
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  companySubtext: {
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    color: PINK,
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 4,
  },
  invoiceNumber: {
    color: "#f8b4d9",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },

  // ── Accent bar ──────────────────────────────────────────
  accentBar: {
    backgroundColor: PINK,
    height: 3,
  },

  // ── Content ─────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 24,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  billToSection: {
    width: "52%",
  },
  sectionLabel: {
    color: PINK,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  clientName: {
    color: DARK,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  clientDetail: {
    color: TEXT,
    fontSize: 9.5,
    lineHeight: 1.6,
  },

  // Invoice info card
  invoiceInfoCard: {
    width: "40%",
    backgroundColor: LIGHT_PINK_BG,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: "solid",
  },
  infoCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoCardLabel: {
    color: MUTED,
    fontSize: 8.5,
  },
  infoCardValue: {
    color: DARK,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
  },
  infoCardDivider: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderTopStyle: "solid",
    marginVertical: 6,
  },

  // ── Table ────────────────────────────────────────────────
  tableContainer: {
    marginBottom: 20,
  },
  tableHeader: {
    backgroundColor: DARK,
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 2,
  },
  tableHeaderText: {
    color: "#f8b4d9",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 0.8, textAlign: "center" },
  colPrice: { flex: 1.2, textAlign: "right" },
  colAmt: { flex: 1.2, textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    borderBottomStyle: "solid",
  },
  tableRowAlt: {
    backgroundColor: "#fdf9fd",
  },
  tableCell: {
    color: TEXT,
    fontSize: 9.5,
  },

  // ── Totals ───────────────────────────────────────────────
  totalsContainer: {
    marginLeft: "auto",
    width: 230,
    marginBottom: 20,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsLabel: { color: MUTED, fontSize: 9.5 },
  totalsValue: { color: TEXT, fontSize: 9.5 },
  totalsDivider: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderTopStyle: "solid",
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: DARK,
    borderRadius: 6,
    marginTop: 4,
  },
  totalLabel: {
    color: "#f8b4d9",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  totalValue: {
    color: PINK,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },

  // ── Notes ───────────────────────────────────────────────
  notesSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: LIGHT_PINK_BG,
    borderLeftWidth: 3,
    borderLeftColor: PINK,
    borderLeftStyle: "solid",
    borderRadius: 3,
  },
  notesLabel: {
    color: PINK,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  notesText: { color: TEXT, fontSize: 9.5, lineHeight: 1.6 },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderTopStyle: "solid",
    paddingVertical: 14,
    paddingHorizontal: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  footerLeft: {
    flexDirection: "column",
  },
  footerLabel: {
    color: MUTED,
    fontSize: 7.5,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  footerValue: {
    color: DARK,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerBrand: {
    color: MUTED,
    fontSize: 8,
  },
  footerEmail: {
    color: PINK,
    fontSize: 8,
    marginTop: 2,
  },
});

interface InvoicePDFDocumentProps {
  invoice: Invoice;
  logoUrl?: string;
}

const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({ invoice, logoUrl }) => {
  const issueDate = format(new Date(invoice.issueDate), "MMM d, yyyy");
  const dueDate = format(new Date(invoice.dueDate), "MMM d, yyyy");

  const statusColor =
    invoice.status === "paid" ? "#16a34a"
    : invoice.status === "overdue" ? "#dc2626"
    : invoice.status === "sent" ? "#2563eb"
    : MUTED;

  return (
    <Document title={`Invoice ${invoice.number}`} author="Opsora Systems">
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            {logoUrl ? (
              <Image src={logoUrl} style={styles.logo} />
            ) : (
              <View style={styles.companyTextBlock}>
                <Text style={styles.companyName}>Opsora Systems</Text>
                <Text style={styles.companySubtext}>Vancouver, BC, Canada</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
          </View>
        </View>

        {/* Pink accent line */}
        <View style={styles.accentBar} />

        {/* Body */}
        <View style={styles.content}>

          {/* Bill To + Invoice Info */}
          <View style={styles.infoRow}>
            <View style={styles.billToSection}>
              <Text style={styles.sectionLabel}>Bill To</Text>
              <Text style={styles.clientName}>{invoice.client.name}</Text>
              {invoice.client.company ? <Text style={styles.clientDetail}>{invoice.client.company}</Text> : null}
              {invoice.client.address ? <Text style={styles.clientDetail}>{invoice.client.address}</Text> : null}
              {(invoice.client.city || invoice.client.province) ? (
                <Text style={styles.clientDetail}>
                  {[invoice.client.city, invoice.client.province, invoice.client.postal].filter(Boolean).join(", ")}
                </Text>
              ) : null}
              {invoice.client.country ? <Text style={styles.clientDetail}>{invoice.client.country}</Text> : null}
              <Text style={[styles.clientDetail, { marginTop: 5 }]}>{invoice.client.email}</Text>
              {invoice.client.phone ? <Text style={styles.clientDetail}>{invoice.client.phone}</Text> : null}
            </View>

            <View style={styles.invoiceInfoCard}>
              <View style={styles.infoCardRow}>
                <Text style={styles.infoCardLabel}>Invoice #</Text>
                <Text style={[styles.infoCardValue, { color: PINK }]}>{invoice.number}</Text>
              </View>
              <View style={styles.infoCardRow}>
                <Text style={styles.infoCardLabel}>Issue Date</Text>
                <Text style={styles.infoCardValue}>{issueDate}</Text>
              </View>
              <View style={styles.infoCardRow}>
                <Text style={styles.infoCardLabel}>Due Date</Text>
                <Text style={styles.infoCardValue}>{dueDate}</Text>
              </View>
              <View style={styles.infoCardDivider} />
              <View style={styles.infoCardRow}>
                <Text style={styles.infoCardLabel}>Status</Text>
                <Text style={[styles.infoCardValue, { color: statusColor }]}>
                  {invoice.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Line Items */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderText, styles.colAmt]}>Amount</Text>
            </View>
            {invoice.items.map((item, index) => (
              <View key={item.id || index} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQty, { textAlign: "center" }]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colPrice, { textAlign: "right" }]}>${item.unitPrice.toFixed(2)}</Text>
                <Text style={[styles.tableCell, styles.colAmt, { textAlign: "right" }]}>${item.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>${invoice.subtotal.toFixed(2)} CAD</Text>
            </View>
            {invoice.discountPct > 0 && (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Discount ({invoice.discountPct}%)</Text>
                  <Text style={[styles.totalsValue, { color: "#16a34a" }]}>-${invoice.discountAmt.toFixed(2)} CAD</Text>
                </View>
                <View style={styles.totalsDivider} />
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>After Discount</Text>
                  <Text style={styles.totalsValue}>${(invoice.subtotal - invoice.discountAmt).toFixed(2)} CAD</Text>
                </View>
              </>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>GST ({invoice.gstRate}%)</Text>
              <Text style={styles.totalsValue}>${invoice.gstAmt.toFixed(2)} CAD</Text>
            </View>
            <View style={styles.totalsDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Due</Text>
              <Text style={styles.totalValue}>${invoice.total.toFixed(2)} CAD</Text>
            </View>
          </View>

          {/* Notes */}
          {invoice.notes ? (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLabel}>Payment Terms</Text>
            <Text style={styles.footerValue}>{invoice.paymentTerms}</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerBrand}>Opsora Systems · Vancouver, BC, Canada</Text>
            <Text style={styles.footerEmail}>rajbarot@opsorasystems.com</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export async function generateInvoicePDF(invoice: Invoice, logoUrl?: string): Promise<Buffer> {
  const doc = <InvoicePDFDocument invoice={invoice} logoUrl={logoUrl} />;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
