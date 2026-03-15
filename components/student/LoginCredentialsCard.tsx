"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";

type LoginCredentialsCardProps = {
  username: string;
  password: string;
};

export default function LoginCredentialsCard({
  username,
  password,
}: LoginCredentialsCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<"username" | "password" | null>(
    null
  );

  async function copyValue(field: "username" | "password", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success(`${field === "username" ? "Username" : "Password"} copied`);
      setTimeout(() => setCopiedField(null), 1200);
    } catch {
      toast.error("Copy failed. Please copy manually.");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <KeyRound className="h-4 w-4" />
            </span>
            Login Credentials
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Student access details for sign-in.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <CredentialField
          label="Username"
          value={username}
          onCopy={() => copyValue("username", username)}
          copied={copiedField === "username"}
          copyAriaLabel="Copy username"
        />

        <CredentialField
          label="Password"
          value={showPassword ? password : "••••••••••••"}
          onCopy={() => copyValue("password", password)}
          copied={copiedField === "password"}
          copyAriaLabel="Copy password"
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />
      </div>
    </section>
  );
}

function CredentialField({
  label,
  value,
  onCopy,
  copied,
  copyAriaLabel,
  rightAction,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  copyAriaLabel: string;
  rightAction?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-800 ring-1 ring-slate-200">
          {value}
        </p>
        {rightAction}
        <button
          type="button"
          onClick={onCopy}
          aria-label={copyAriaLabel}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

