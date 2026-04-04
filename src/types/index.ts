export interface Settings {
  id: number;
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  companyCity: string;
  companyProvince: string;
  companyPostal: string;
  companyCountry: string;
  gstNumber: string;
  gstRate: number;
  invoicePrefix: string;
  paymentTerms: string;
  logoPath: string;
  emailSignature: string;
  reminderDays: string;
  nextInvoiceSeq: number;
}

export interface Client {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal: string;
  country: string;
  notes: string;
  createdAt: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  unitPrice: number;
  createdAt: string;
}

export interface InvoiceItem {
  id?: number;
  invoiceId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  sortOrder: number;
}

export interface Invoice {
  id: number;
  number: string;
  clientId: number;
  client: Client;
  status: "draft" | "sent" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountPct: number;
  discountAmt: number;
  gstRate: number;
  gstAmt: number;
  total: number;
  paymentTerms: string;
  notes: string;
  sentAt: string | null;
  paidAt: string | null;
  paymentRef: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  reminders?: Reminder[];
}

export interface Template {
  id: number;
  name: string;
  clientId: number | null;
  client: Client | null;
  items: string; // JSON string
  notes: string;
  paymentTerms: string;
  discountPct: number;
  createdAt: string;
}

export interface Reminder {
  id: number;
  invoiceId: number;
  daysAfterDue: number;
  scheduledAt: string;
  sentAt: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalUnpaid: number;
  totalPaid: number;
  overdueCount: number;
  recentInvoices: Invoice[];
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type InvoiceFilter = "all" | "unpaid" | "paid" | "overdue";
