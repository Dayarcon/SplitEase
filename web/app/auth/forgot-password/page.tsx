"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page flex items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
              padding: "12px 20px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>S</span>
            </div>
            <span
              style={{
                fontWeight: 900,
                fontSize: 20,
                background: "linear-gradient(135deg, #4f46e5, #9333ea)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SplitEase
            </span>
          </div>
        </div>

        <div className="app-card overflow-hidden">
          <div className="app-card-header hero-surface text-center">
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
            <h1 className="app-title text-center">Forgot your password?</h1>
            <p className="app-subtitle">
              No worries! Enter your email and we'll send you a reset link.
            </p>
          </div>

          <div className="app-card-body">
            {submitted ? (
              /* Success state */
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
                <h2
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: "#0f172a",
                    marginBottom: 12,
                  }}
                >
                  Check your inbox!
                </h2>
                <p
                  style={{
                    color: "#475569",
                    fontSize: 14,
                    lineHeight: 1.6,
                    marginBottom: 28,
                  }}
                >
                  If <strong>{email}</strong> is registered with SplitEase, you'll receive
                  a password reset link shortly. The link expires in 1 hour.
                </p>
                <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>
                  Didn't get the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setSubmitted(false)}
                    style={{
                      color: "#6366f1",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                      padding: 0,
                    }}
                  >
                    try again
                  </button>
                  .
                </p>
                <Link href="/auth/signin" className="btn-primary w-full" style={{ display: "block", textAlign: "center" }}>
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* Form state */
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="alert-error" role="alert">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending reset link...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <div className="text-center">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    ← Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
