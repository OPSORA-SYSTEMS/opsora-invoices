"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Delete } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDigit = async (digit: string) => {
    if (loading) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError("");

    if (newPin.length === 4) {
      setLoading(true);
      const result = await signIn("credentials", {
        pin: newPin,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect PIN. Try again.");
        setPin("");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xs relative">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-brand-bg px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-brand-accent rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/30">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Opsora Systems</h1>
            <p className="text-brand-highlight/70 text-sm mt-1">Invoice Manager</p>
          </div>

          <div className="h-1 bg-gradient-to-r from-brand-accent to-pink-400" />

          <div className="px-8 py-8">
            <p className="text-center text-sm font-medium text-brand-textMuted mb-6">
              Enter your 4-digit PIN
            </p>

            {/* PIN dots */}
            <div className="flex justify-center gap-4 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                    i < pin.length
                      ? "bg-brand-accent border-brand-accent"
                      : "border-brand-border"
                  }`}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700 text-center mb-4">
                {error}
              </div>
            )}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3">
              {["1","2","3","4","5","6","7","8","9"].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  disabled={loading || pin.length >= 4}
                  className="h-14 rounded-xl border border-brand-border text-xl font-semibold text-brand-textDark hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-colors disabled:opacity-40"
                >
                  {d}
                </button>
              ))}
              {/* Bottom row: empty, 0, delete */}
              <div />
              <button
                onClick={() => handleDigit("0")}
                disabled={loading || pin.length >= 4}
                className="h-14 rounded-xl border border-brand-border text-xl font-semibold text-brand-textDark hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-colors disabled:opacity-40"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
                className="h-14 rounded-xl border border-brand-border flex items-center justify-center text-brand-textMuted hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors disabled:opacity-40"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-brand-highlight/40 mt-6">
          &copy; {new Date().getFullYear()} Opsora Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
