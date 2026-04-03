"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const PURPLE = "#7C3AED";

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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #F0F9FF 100%)", display: "flex", flexDirection: "column" }}>
      {/* ── TOP NAV ── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.8)" }}>
        <Link href="/" style={{ fontWeight: 900, fontSize: 22, color: PURPLE, letterSpacing: "-0.3px", textDecoration: "none" }}>
          SplitEase
        </Link>
        <Link href="mailto:support@splitease.com" style={{ fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none" }}>
          Support
        </Link>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", position: "relative" }}>
        {/* Decorative bubbles (bottom right) */}
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 320, height: 320, opacity: 0.15, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: 20, right: 20, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #c4b5fd, #7c3aed)", opacity: 0.5 }} />
          <div style={{ position: "absolute", bottom: 80, right: 140, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #e9d5ff, #a78bfa)", opacity: 0.4 }} />
          <div style={{ position: "absolute", bottom: 160, right: 60, width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #ddd6fe, #8b5cf6)", opacity: 0.3 }} />
        </div>

        <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
          {/* Card */}
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 40px rgba(124,58,237,0.10), 0 2px 8px rgba(0,0,0,0.06)", padding: "40px 36px" }}>

            {submitted ? (
              /* ── SUCCESS STATE ── */
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
                  📬
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Check your inbox!</h2>
                <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                  If <strong>{email}</strong> is registered with SplitEase, you'll receive a password reset link shortly. The link expires in 1 hour.
                </p>
                <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 28 }}>
                  Didn't get the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setSubmitted(false)}
                    style={{ color: PURPLE, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0 }}
                  >
                    try again
                  </button>.
                </p>
                <Link
                  href="/auth/signin"
                  style={{ display: "block", textAlign: "center", padding: "13px", background: PURPLE, color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none" }}
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              /* ── FORM STATE ── */
              <>
                {/* Icon */}
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>

                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 10 }}>Forgot Password</h1>
                <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 28, lineHeight: 1.6 }}>
                  Enter the email address associated with your SplitEase account and we'll send you a secure link to reset your password.
                </p>

                {error && (
                  <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, padding: "10px 14px", marginBottom: 20, color: "#e11d48", fontSize: 13, fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                      Email Address
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>✉</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        required
                        autoComplete="email"
                        style={{ width: "100%", padding: "12px 14px 12px 40px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 14, color: "#0f172a", background: "#F8FAFC", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  {/* Send Reset Link Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: "100%", padding: "13px", background: loading ? "#a78bfa" : PURPLE, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 18 }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin" style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3"/>
                          <path fill="currentColor" opacity="0.8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending reset link...
                      </>
                    ) : "Send Reset Link →"}
                  </button>
                </form>

                {/* Back to Login */}
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <Link href="/auth/signin" style={{ fontSize: 14, fontWeight: 600, color: PURPLE, textDecoration: "none" }}>
                    ← Back to Login
                  </Link>
                </div>

                {/* OR CONTACT HUMAN HELP */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.8px", textTransform: "uppercase", whiteSpace: "nowrap" }}>OR CONTACT HUMAN HELP</span>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>

                <p style={{ textAlign: "center", fontSize: 13, color: "#64748b" }}>
                  Still having trouble?{" "}
                  <Link href="mailto:support@splitease.com" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>
                    Contact our concierge team
                  </Link>
                  {" "}for immediate assistance.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: "rgba(255,255,255,0.5)", borderTop: "1px solid rgba(255,255,255,0.8)", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>SplitEase</span>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {["Privacy Policy", "Terms of Service", "Cookie Policy", "Contact Us"].map(link => (
            <span key={link} style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", cursor: "pointer" }}>{link}</span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>© 2024 SPLITEASE. ALL RIGHTS RESERVED.</span>
      </footer>
    </div>
  );
}
