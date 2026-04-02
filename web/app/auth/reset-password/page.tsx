"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
        // Redirect to sign-in after 3 seconds
        setTimeout(() => router.push("/auth/signin"), 3000);
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
            <div style={{ fontSize: 40, marginBottom: 8 }}>
              {success ? "✅" : "🔑"}
            </div>
            <h1 className="app-title text-center">
              {success ? "Password Reset!" : "Choose a New Password"}
            </h1>
            <p className="app-subtitle">
              {success
                ? "Your password has been updated successfully."
                : "Enter a strong new password for your account."}
            </p>
          </div>

          <div className="app-card-body">
            {success ? (
              /* Success state */
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                  You'll be redirected to the sign-in page in a moment...
                </p>
                <Link href="/auth/signin" className="btn-primary w-full" style={{ display: "block", textAlign: "center" }}>
                  Sign In Now
                </Link>
              </div>
            ) : (
              /* Form state */
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="alert-error" role="alert">
                    {error}
                    {(error.includes("invalid") || error.includes("expired")) && (
                      <div style={{ marginTop: 8 }}>
                        <Link href="/auth/forgot-password" style={{ color: "#6366f1", fontWeight: 600, fontSize: 13 }}>
                          Request a new reset link →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700"
                    htmlFor="password"
                  >
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        fontSize: 16,
                        padding: 0,
                        lineHeight: 1,
                      }}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {/* Password strength hint */}
                  {password.length > 0 && (
                    <p
                      style={{
                        fontSize: 12,
                        marginTop: 6,
                        color:
                          password.length >= 8
                            ? "#10b981"
                            : password.length >= 6
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      {password.length >= 8
                        ? "✓ Strong password"
                        : password.length >= 6
                        ? "⚠ Acceptable, but longer is better"
                        : "✗ Too short (minimum 6 characters)"}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-semibold text-slate-700"
                    htmlFor="confirmPassword"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                    placeholder="Re-enter your new password"
                    required
                    autoComplete="new-password"
                  />
                  {confirmPassword.length > 0 && (
                    <p
                      style={{
                        fontSize: 12,
                        marginTop: 6,
                        color: password === confirmPassword ? "#10b981" : "#ef4444",
                      }}
                    >
                      {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
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
                      Resetting password...
                    </span>
                  ) : (
                    "Reset Password"
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="app-page flex items-center justify-center min-h-screen">
          <div style={{ textAlign: "center", color: "#6366f1" }}>Loading...</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
