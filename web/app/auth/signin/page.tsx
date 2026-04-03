"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";

const PURPLE = "#7C3AED";
const PURPLE_DARK = "#6D28D9";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push("/");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
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
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ fontSize: 14, color: "#64748b", cursor: "pointer" }}>How it works</span>
          <span style={{ fontSize: 14, color: "#64748b", cursor: "pointer" }}>Pricing</span>
          <span style={{ fontSize: 14, color: "#64748b", cursor: "pointer" }}>Support</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/auth/signin" style={{ fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none" }}>Log In</Link>
          <Link href="/auth/signup" style={{ fontSize: 14, fontWeight: 600, color: "#fff", background: PURPLE, borderRadius: 20, padding: "8px 20px", textDecoration: "none" }}>Sign Up</Link>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Card */}
          <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 40px rgba(124,58,237,0.10), 0 2px 8px rgba(0,0,0,0.06)", padding: "40px 36px" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: 6 }}>Login</h1>
            <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 28 }}>Welcome back to the Ethereal Ledger.</p>

            {error && (
              <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, padding: "10px 14px", marginBottom: 20, color: "#e11d48", fontSize: 13, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    autoComplete="email"
                    style={{ width: "100%", padding: "12px 14px 12px 40px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 14, color: "#0f172a", background: "#F8FAFC", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }}>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{ width: "100%", padding: "12px 44px 12px 40px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 14, color: "#0f172a", background: "#F8FAFC", outline: "none", boxSizing: "border-box" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, padding: 0 }}
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: PURPLE, width: 15, height: 15 }}
                  />
                  Remember me
                </label>
                <Link href="/auth/forgot-password" style={{ fontSize: 13, fontWeight: 600, color: PURPLE, textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>

              {/* Log In Button */}
              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", padding: "13px", background: loading ? "#a78bfa" : PURPLE, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 22 }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3"/>
                      <path fill="currentColor" opacity="0.8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </>
                ) : "Log In"}
              </button>
            </form>

            {/* OR CONTINUE WITH */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.8px", textTransform: "uppercase", whiteSpace: "nowrap" }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>

            {/* Social Buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: "#F8FAFC", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: "#F8FAFC", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4zm-3.01-17.7c.06 2.04-1.8 3.7-3.76 3.55-.27-1.97 1.65-3.76 3.76-3.55z"/>
                </svg>
                Apple
              </button>
            </div>

            {/* Create account */}
            <p style={{ textAlign: "center", fontSize: 13, color: "#64748b" }}>
              New to SplitEase?{" "}
              <Link href="/auth/signup" style={{ color: PURPLE, fontWeight: 700, textDecoration: "none" }}>Create account</Link>
            </p>
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
