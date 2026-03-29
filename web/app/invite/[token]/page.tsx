"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, CheckCircle2, AlertCircle, Loader2, LogIn, UserPlus } from "lucide-react";

interface GroupInfo {
  id: number;
  name: string;
  emoji?: string;
  currency?: string;
  memberCount: number;
  members: { id: number; name: string }[];
  alreadyMember: boolean;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥", AED: "د.إ",
};

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { data: session, status: authStatus } = useSession();

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`/api/invite/${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Invalid invite link");
          return;
        }
        const data = await res.json();
        setGroup(data);
        if (data.alreadyMember) setJoined(true);
      } catch {
        setError("Failed to load invite. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [token]);

  const handleJoin = async () => {
    if (!session) return;
    setJoining(true);
    setError("");
    try {
      const res = await fetch(`/api/invite/${token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to join group");
        return;
      }
      setJoined(true);
      // Redirect to the group after a short delay
      setTimeout(() => router.push(`/groups/${data.groupId}`), 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (loading || authStatus === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, border: "4px solid #c7d2fe", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#4f46e5", fontWeight: 600, fontSize: 16 }}>Loading invite…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ width: "100%", maxWidth: 440, animation: "fadeIn 0.4s ease" }}>

        {/* Logo/Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "white", borderRadius: 20, padding: "10px 20px", boxShadow: "0 2px 12px rgba(79,70,229,0.12)", border: "1px solid #e0e7ff" }}>
            <span style={{ fontSize: 24 }}>💰</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#4f46e5", letterSpacing: "-0.5px" }}>SplitEase</span>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 28, padding: 32, boxShadow: "0 8px 40px rgba(0,0,0,0.10)", border: "1px solid #e0e7ff" }}>

          {error ? (
            /* Error state */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <AlertCircle style={{ width: 32, height: 32, color: "#e11d48" }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Invite Not Found</h2>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>{error}</p>
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#4f46e5", color: "white", fontWeight: 700, fontSize: 15, padding: "12px 24px", borderRadius: 14, textDecoration: "none" }}>
                Go to SplitEase
              </Link>
            </div>
          ) : group ? (
            /* Group info + join */
            <>
              {/* Group avatar */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, #818cf8, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 36 }}>
                  {group.emoji || "💰"}
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  You're invited to join
                </p>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: 0 }}>{group.name}</h1>
              </div>

              {/* Group stats */}
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1, background: "#f8fafc", borderRadius: 14, padding: "12px 16px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "#4f46e5", margin: 0 }}>{group.memberCount}</p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontWeight: 600 }}>Members</p>
                </div>
                <div style={{ flex: 1, background: "#f8fafc", borderRadius: 14, padding: "12px 16px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "#4f46e5", margin: 0 }}>
                    {CURRENCY_SYMBOLS[group.currency || "INR"] || "₹"}
                  </p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontWeight: 600 }}>{group.currency || "INR"}</p>
                </div>
              </div>

              {/* Member avatars */}
              {group.members.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Current members</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {group.members.map((m) => (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#eef2ff", borderRadius: 20, padding: "4px 12px 4px 6px" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #818cf8, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 11 }}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#4338ca" }}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              {joined ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: "14px 16px" }}>
                    <CheckCircle2 style={{ width: 22, height: 22, color: "#22c55e", flexShrink: 0 }} />
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#166534", margin: 0 }}>
                      {group.alreadyMember ? "You're already in this group!" : "You've joined! Redirecting…"}
                    </p>
                  </div>
                  <Link href={`/groups/${group.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#4f46e5", color: "white", fontWeight: 700, fontSize: 15, padding: "14px 24px", borderRadius: 14, textDecoration: "none" }}>
                    <Users style={{ width: 18, height: 18 }} />
                    Go to Group
                  </Link>
                </div>
              ) : session ? (
                /* Logged in — show Join button */
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 12, padding: "10px 14px" }}>
                      <AlertCircle style={{ width: 16, height: 16, color: "#e11d48", flexShrink: 0 }} />
                      <p style={{ fontSize: 13, color: "#e11d48", margin: 0 }}>{error}</p>
                    </div>
                  )}
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: joining ? "#818cf8" : "#4f46e5", color: "white", fontWeight: 700, fontSize: 16, padding: "15px 24px", borderRadius: 14, border: "none", cursor: joining ? "not-allowed" : "pointer", transition: "background 0.2s" }}
                  >
                    {joining ? (
                      <>
                        <Loader2 style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} />
                        Joining…
                      </>
                    ) : (
                      <>
                        <Users style={{ width: 20, height: 20 }} />
                        Join {group.name}
                      </>
                    )}
                  </button>
                  <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", margin: 0 }}>
                    Joining as <strong style={{ color: "#475569" }}>{session.user?.name}</strong>
                  </p>
                </div>
              ) : (
                /* Not logged in — prompt to sign in or sign up */
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ textAlign: "center", fontSize: 14, color: "#64748b", marginBottom: 4 }}>
                    Sign in to join this group
                  </p>
                  <Link
                    href={`/auth/signin?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#4f46e5", color: "white", fontWeight: 700, fontSize: 15, padding: "13px 24px", borderRadius: 14, textDecoration: "none" }}
                  >
                    <LogIn style={{ width: 18, height: 18 }} />
                    Sign In
                  </Link>
                  <Link
                    href={`/auth/signup?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#f1f5f9", color: "#334155", fontWeight: 700, fontSize: 15, padding: "13px 24px", borderRadius: 14, textDecoration: "none", border: "1px solid #e2e8f0" }}
                  >
                    <UserPlus style={{ width: 18, height: 18 }} />
                    Create Account
                  </Link>
                </div>
              )}
            </>
          ) : null}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 20 }}>
          SplitEase — Split expenses with friends
        </p>
      </div>
    </div>
  );
}
