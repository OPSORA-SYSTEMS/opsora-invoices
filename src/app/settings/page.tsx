"use client";

import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Settings } from "@/types";
import {
  Building2,
  Image as ImageIcon,
  Receipt,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [smtpResult, setSmtpResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        showMessage("success", "Settings saved successfully!");
      } else {
        showMessage("error", "Failed to save settings");
      }
    } catch {
      showMessage("error", "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { path } = await res.json();
        setSettings((s) => s ? { ...s, logoPath: path } : s);
        showMessage("success", "Logo uploaded successfully!");
      } else {
        const err = await res.json();
        showMessage("error", err.error || "Failed to upload logo");
      }
    } catch {
      showMessage("error", "Upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setSmtpResult(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-smtp" }),
      });
      const result = await res.json();
      setSmtpResult(result);
    } catch {
      setSmtpResult({ success: false, message: "Connection test failed" });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleReminderDayToggle = (day: number) => {
    if (!settings) return;
    const days = settings.reminderDays
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d)
      .map(Number);

    let newDays: number[];
    if (days.includes(day)) {
      newDays = days.filter((d) => d !== day);
    } else {
      newDays = [...days, day].sort((a, b) => a - b);
    }

    setSettings({ ...settings, reminderDays: newDays.join(",") });
  };

  const getReminderDays = () => {
    if (!settings) return [];
    return settings.reminderDays
      .split(",")
      .map((d) => parseInt(d.trim()))
      .filter((d) => !isNaN(d));
  };

  const updateField = (key: keyof Settings, value: string | number) => {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  };

  if (loading || !settings) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  const sectionClass = "bg-white rounded-xl border border-brand-border p-6 shadow-sm space-y-4";
  const sectionHeaderClass = "flex items-center gap-2.5 mb-4 pb-3 border-b border-brand-border";
  const iconClass = "w-5 h-5 text-brand-accent";

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-textDark">Settings</h1>
            <p className="text-sm text-brand-textMuted mt-0.5">
              Configure your company and application settings
            </p>
          </div>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save All Settings
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Company Info */}
        <div className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Building2 className={iconClass} />
            <h2 className="text-base font-semibold text-brand-textDark">
              Company Information
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={settings.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
            />
            <Input
              label="Company Email"
              type="email"
              value={settings.companyEmail}
              onChange={(e) => updateField("companyEmail", e.target.value)}
            />
            <div className="col-span-2">
              <Input
                label="Street Address"
                value={settings.companyAddress}
                onChange={(e) => updateField("companyAddress", e.target.value)}
              />
            </div>
            <Input
              label="City"
              value={settings.companyCity}
              onChange={(e) => updateField("companyCity", e.target.value)}
            />
            <Input
              label="Province"
              value={settings.companyProvince}
              onChange={(e) => updateField("companyProvince", e.target.value)}
            />
            <Input
              label="Postal Code"
              value={settings.companyPostal}
              onChange={(e) => updateField("companyPostal", e.target.value)}
            />
            <Input
              label="Country"
              value={settings.companyCountry}
              onChange={(e) => updateField("companyCountry", e.target.value)}
            />
          </div>
        </div>

        {/* Logo */}
        <div className={sectionClass}>
          <div className={sectionHeaderClass}>
            <ImageIcon className={iconClass} />
            <h2 className="text-base font-semibold text-brand-textDark">Company Logo</h2>
          </div>
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <p className="text-sm text-brand-textMuted mb-3">
                Upload your company logo to appear on invoices and emails.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadingLogo}
                >
                  <ImageIcon className="w-4 h-4" />
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
                {settings.logoPath && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateField("logoPath", "")}
                  >
                    Remove Logo
                  </Button>
                )}
              </div>
              {settings.logoPath && (
                <Input
                  label="Logo URL Path"
                  value={settings.logoPath}
                  onChange={(e) => updateField("logoPath", e.target.value)}
                  className="mt-3"
                  hint="Path to logo file (e.g., /uploads/logo.png)"
                />
              )}
            </div>
            {settings.logoPath && (
              <div className="w-32 h-20 border border-brand-border rounded-lg overflow-hidden bg-brand-surface2 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.logoPath}
                  alt="Company logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tax & Invoice */}
        <div className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Receipt className={iconClass} />
            <h2 className="text-base font-semibold text-brand-textDark">
              Tax &amp; Invoice Settings
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GST Number"
              placeholder="Your GST registration number"
              value={settings.gstNumber}
              onChange={(e) => updateField("gstNumber", e.target.value)}
            />
            <Input
              label="GST Rate (%)"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={settings.gstRate}
              onChange={(e) => updateField("gstRate", parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Invoice Prefix"
              placeholder="OPS"
              value={settings.invoicePrefix}
              onChange={(e) => updateField("invoicePrefix", e.target.value)}
              hint="e.g., OPS → OPS-2026-001"
            />
            <Input
              label="Default Payment Terms"
              placeholder="Due on receipt"
              value={settings.paymentTerms}
              onChange={(e) => updateField("paymentTerms", e.target.value)}
            />
          </div>
        </div>

        {/* Email & Reminders */}
        <div className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Mail className={iconClass} />
            <h2 className="text-base font-semibold text-brand-textDark">
              Email &amp; Reminders
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-textDark mb-1.5">
              Email Signature
            </label>
            <textarea
              value={settings.emailSignature}
              onChange={(e) => updateField("emailSignature", e.target.value)}
              placeholder="Your email signature (appended to all emails)..."
              rows={4}
              className="w-full text-sm border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent text-brand-textDark placeholder-brand-textMuted resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-textDark mb-2">
              Send Reminders (days after due date)
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 5, 7, 14].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleReminderDayToggle(day)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold border-2 transition-all ${
                    getReminderDays().includes(day)
                      ? "bg-brand-accent border-brand-accent text-white shadow-sm shadow-brand-accent/25"
                      : "bg-white border-brand-border text-brand-textMuted hover:border-brand-accent hover:text-brand-accent"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-brand-textMuted mt-2">
              Currently: days {settings.reminderDays || "none"} after due date
            </p>
          </div>

          <div className="pt-2 border-t border-brand-border">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-brand-textDark">
                  Test SMTP Connection
                </div>
                <div className="text-xs text-brand-textMuted mt-0.5">
                  Verify your email configuration is working
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSmtp}
                loading={testingSmtp}
              >
                Test Connection
              </Button>
            </div>

            {smtpResult && (
              <div
                className={`mt-3 flex items-center gap-2 text-sm ${
                  smtpResult.success ? "text-green-600" : "text-red-600"
                }`}
              >
                {smtpResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {smtpResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Shield className={iconClass} />
            <h2 className="text-base font-semibold text-brand-textDark">Security</h2>
          </div>
          <div className="bg-brand-surface2 rounded-lg p-4 border border-brand-border">
            <div className="text-sm font-medium text-brand-textDark mb-1">
              Admin Password
            </div>
            <p className="text-sm text-brand-textMuted">
              To change the admin password, update the{" "}
              <code className="text-brand-accent bg-pink-50 px-1 py-0.5 rounded text-xs">
                ADMIN_PASSWORD_HASH
              </code>{" "}
              environment variable. Use the{" "}
              <code className="text-brand-accent bg-pink-50 px-1 py-0.5 rounded text-xs">
                npm run hash-password &lt;new-password&gt;
              </code>{" "}
              script to generate a bcrypt hash.
            </p>
          </div>
        </div>

        {/* Save button bottom */}
        <div className="flex justify-end pb-4">
          <Button variant="primary" size="lg" onClick={handleSave} loading={saving}>
            Save All Settings
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
