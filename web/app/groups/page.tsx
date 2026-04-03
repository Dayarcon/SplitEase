"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/app/components/AppSidebar";
import { Plus, Users, ChevronRight } from "lucide-react";

const PURPLE = "#7C3AED";

interface Group {
  id: number;
  name: string;
  emoji?: string;
  currency?: string;
  members: { userId: number; user: { id: number; name: string } }[];
  expenses: { amount: number; paidById: number; splits: { userId: number; amount: number }[] }[];
}

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/groups")
      .then(r => r.json())
      .then(data => setGroups(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  const currentUserId = session?.user?.id ? parseInt(session.user.id as string) : null;

  if (loading) {
    return (
      <AppShell activeTab="groups">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F8F5FF" }}>
          <div style={{ width: 44, height: 44, border: `4px solid #EDE9FE`, borderTopColor: PURPLE, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeTab="groups">
      <div style={{ background: "#F8F5FF", minHeight: "100vh" }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        {/* Header */}
        <div style={{ padding: "24px 20px 0" }} className="lg:px-8">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.3px" }}>Groups</h1>
              <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                {groups.length} group{groups.length !== 1 ? "s" : ""} you're part of
              </p>
            </div>
            <Link
              href="/groups/new"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "10px 18px", background: PURPLE, color: "white",
                borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 700,
              }}
            >
              <Plus size={16} />
              New Group
            </Link>
          </div>
        </div>

        {/* Groups list */}
        <div style={{ padding: "0 20px 100px" }} className="lg:px-8 lg:max-w-2xl">
          {groups.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", background: "white", borderRadius: 20, border: "1px solid #EDE9FE" }}>
              <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>👥</span>
              <p style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>No groups yet</p>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
                Create a group to start splitting expenses with friends, family, or colleagues.
              </p>
              <Link
                href="/groups/new"
                style={{ display: "inline-block", padding: "11px 24px", background: PURPLE, color: "white", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none" }}
              >
                Create a Group →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeIn 0.3s ease" }}>
              {groups.map(group => {
                const totalSpend = group.expenses.reduce((s, e) => s + e.amount, 0);
                const memberCount = group.members.length;

                return (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        background: "white",
                        borderRadius: 18,
                        border: "1px solid #e2e8f0",
                        padding: "16px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#c4b5fd";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(124,58,237,0.08)";
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
                        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                        (e.currentTarget as HTMLDivElement).style.transform = "none";
                      }}
                    >
                      {/* Group avatar */}
                      <div style={{
                        width: 50, height: 50, borderRadius: 15,
                        background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: group.emoji ? 24 : 20,
                        color: "white", fontWeight: 900,
                        flexShrink: 0,
                      }}>
                        {group.emoji || group.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {group.name}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                            <Users size={12} />
                            {memberCount} member{memberCount !== 1 ? "s" : ""}
                          </span>
                          <span style={{ fontSize: 10, color: "#cbd5e1" }}>·</span>
                          <span style={{ fontSize: 12, color: "#64748b" }}>
                            {group.expenses.length} expense{group.expenses.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Total + chevron */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 900, color: "#0f172a", margin: 0 }}>
                          ₹{totalSpend.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>total</p>
                      </div>
                      <ChevronRight size={16} color="#cbd5e1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
