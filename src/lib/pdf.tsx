import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
  Image,
} from "@react-pdf/renderer";
import { Invoice } from "@/types";
import { format } from "date-fns";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a0a2e",
    flexDirection: "column",
  },
  // Header
  header: {
    backgroundColor: "#1a0a2e",
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoImage: {
    width: 130,
    height: 55,
    objectFit: "contain",
  },
  companyName: {
    color: "#ffffff",
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  companySubtext: {
    color: "#f8b4d9",
    fontSize: 9,
    marginTop: 4,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    color: "#e91e8c",
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
  },
  invoiceNumber: {
    color: "#f8b4d9",
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  // Pink bar
  accentBar: {
    backgroundColor: "#e91e8c",
    height: 3,
  },
  // Content wrapper — expands to fill page, pushes footer down
  content: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 28,
    paddingBottom: 16,
  },
  // Bill To & Invoice Info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  billToSection: {
    width: "50%",
  },
  sectionLabel: {
    color: "#e91e8c",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  clientName: {
    color: "#1a0a2e",
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  clientDetail: {
    color: "#374151",
    fontSize: 9.5,
    lineHeight: 1.6,
  },
  invoiceInfoSection: {
    width: "40%",
    alignItems: "flex-end",
  },
  invoiceInfoCard: {
    backgroundColor: "#fdf2f8",
    borderRadius: 6,
    padding: 14,
    width: "100%",
  },
  invoiceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  invoiceInfoLabel: {
    color: "#9ca3af",
    fontSize: 8.5,
    letterSpacing: 0.3,
  },
  invoiceInfoValue: {
    color: "#1a0a2e",
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
  },
  // Divider
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#f3d4e8",
    borderTopStyle: "solid",
    marginVertical: 10,
  },
  // Line items table
  tableContainer: {
    marginBottom: 24,
  },
  tableHeader: {
    backgroundColor: "#1a0a2e",
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 4,
  },
  tableHeaderCell: {
    color: "#f8b4d9",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  colDescription: { flex: 3 },
  colQty: { flex: 0.8, textAlign: "center" },
  colUnitPrice: { flex: 1.2, textAlign: "right" },
  colAmount: { flex: 1.2, textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3d4e8",
    borderBottomStyle: "solid",
  },
  tableRowAlt: {
    backgroundColor: "#fdf9fd",
  },
  tableCell: {
    color: "#374151",
    fontSize: 9.5,
  },
  // Totals
  totalsContainer: {
    marginLeft: "auto",
    width: 240,
    marginBottom: 24,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsLabel: {
    color: "#9ca3af",
    fontSize: 9.5,
  },
  totalsValue: {
    color: "#374151",
    fontSize: 9.5,
  },
  totalsDivider: {
    borderTopWidth: 1,
    borderTopColor: "#f3d4e8",
    borderTopStyle: "solid",
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#1a0a2e",
    borderRadius: 5,
    marginTop: 6,
  },
  totalLabel: {
    color: "#f8b4d9",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  totalValue: {
    color: "#e91e8c",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  // Notes
  notesSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#fdf2f8",
    borderLeftWidth: 3,
    borderLeftColor: "#e91e8c",
    borderLeftStyle: "solid",
    borderRadius: 2,
  },
  notesLabel: {
    color: "#e91e8c",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  notesText: {
    color: "#374151",
    fontSize: 9.5,
    lineHeight: 1.6,
  },
  // Footer — always at bottom
  footer: {
    backgroundColor: "#1a0a2e",
    paddingVertical: 18,
    paddingHorizontal: 48,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  footerText: {
    color: "#f8b4d9",
    fontSize: 9,
  },
  paymentTermsText: {
    color: "#e91e8c",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  footerNote: {
    color: "#9ca3af",
    fontSize: 8,
    textAlign: "center",
    marginTop: 4,
  },
});

interface InvoicePDFDocumentProps {
  invoice: Invoice;
  logoUrl?: string;
}

const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({
  invoice,
  logoUrl,
}) => {
  const issueDate = format(new Date(invoice.issueDate), "MMM d, yyyy");
  const dueDate = format(new Date(invoice.dueDate), "MMM d, yyyy");

  return (
    <Document
      title={`Invoice ${invoice.number}`}
      author="Opsora Systems"
      subject={`Invoice for ${invoice.client.name}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {logoUrl ? (
              <Image src={logoUrl} style={styles.logoImage} />
            ) : (
              <>
                <Text style={styles.companyName}>Opsora Systems</Text>
                <Text style={styles.companySubtext}>Vancouver, BC, Canada</Text>
              </>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
          </View>
        </View>

        {/* Accent bar */}
        <View style={styles.accentBar} />

        {/* Body — flex: 1 pushes footer to bottom */}
        <View style={styles.content}>
          {/* Bill To & Invoice Info */}
          <View style={styles.infoRow}>
            <View style={styles.billToSection}>
              <Text style={styles.sectionLabel}>Bill To</Text>
              <Text style={styles.clientName}>{invoice.client.name}</Text>
              {invoice.client.company ? (
                <Text style={styles.clientDetail}>{invoice.client.company}</Text>
              ) : null}
              {invoice.client.address ? (
                <Text style={styles.clientDetail}>{invoice.client.address}</Text>
              ) : null}
              {(invoice.client.city || invoice.client.province) ? (
                <Text style={styles.clientDetail}>
                  {[invoice.client.city, invoice.client.province, invoice.client.postal]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              ) : null}
              {invoice.client.country ? (
                <Text style={styles.clientDetail}>{invoice.client.country}</Text>
              ) : null}
              <Text style={[styles.clientDetail, { marginTop: 5 }]}>
                {invoice.client.email}
              </Text>
              {invoice.client.phone ? (
                <Text style={styles.clientDetail}>{invoice.client.phone}</Text>
              ) : null}
            </View>

            <View style={styles.invoiceInfoSection}>
              <View style={styles.invoiceInfoCard}>
                <View style={styles.invoiceInfoRow}>
                  <Text style={styles.invoiceInfoLabel}>Invoice #</Text>
                  <Text style={[styles.invoiceInfoValue, { color: "#e91e8c" }]}>
                    {invoice.number}
                  </Text>
                </View>
                <View style={styles.invoiceInfoRow}>
                  <Text style={styles.invoiceInfoLabel}>Issue Date</Text>
                  <Text style={styles.invoiceInfoValue}>{issueDate}</Text>
                </View>
                <View style={styles.invoiceInfoRow}>
                  <Text style={styles.invoiceInfoLabel}>Due Date</Text>
                  <Text style={styles.invoiceInfoValue}>{dueDate}</Text>
                </View>
                <View style={[styles.divider, { marginVertical: 6 }]} />
                <View style={styles.invoiceInfoRow}>
                  <Text style={styles.invoiceInfoLabel}>Status</Text>
                  <Text style={[styles.invoiceInfoValue, {
                    color: invoice.status === "paid" ? "#16a34a"
                      : invoice.status === "overdue" ? "#dc2626"
                      : invoice.status === "sent" ? "#2563eb"
                      : "#9ca3af"
                  }]}>
                    {invoice.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Line Items Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
            </View>

            {invoice.items.map((item, index) => (
              <View
                key={item.id || index}
                style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableCell, styles.colDescription]}>
                  {item.description}
                </Text>
                <Text style={[styles.tableCell, styles.colQty, { textAlign: "center" }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, styles.colUnitPrice, { textAlign: "right" }]}>
                  ${item.unitPrice.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, styles.colAmount, { textAlign: "right" }]}>
                  ${item.amount.toFixed(2)}
                </Text>
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
                  <Text style={[styles.totalsValue, { color: "#16a34a" }]}>
                    -${invoice.discountAmt.toFixed(2)} CAD
                  </Text>
                </View>
                <View style={styles.totalsDivider} />
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>After Discount</Text>
                  <Text style={styles.totalsValue}>
                    ${(invoice.subtotal - invoice.discountAmt).toFixed(2)} CAD
                  </Text>
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

        {/* Footer — pinned to bottom by flex layout */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Payment Terms:{" "}
              <Text style={styles.paymentTermsText}>{invoice.paymentTerms}</Text>
            </Text>
            <Text style={styles.footerText}>Opsora Systems · Vancouver, BC</Text>
          </View>
          <Text style={styles.footerNote}>
            Questions? Contact us at rajbarot@opsorasystems.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export async function generateInvoicePDF(
  invoice: Invoice,
  logoUrl?: string
): Promise<Buffer> {
  const doc = <InvoicePDFDocument invoice={invoice} logoUrl={logoUrl} />;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
