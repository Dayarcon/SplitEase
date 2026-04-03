"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Users, Plus, X, Check, Settings, Bell, User,
  Activity, Wallet, ChevronRight, Zap
} from "lucide-react";

interface Group {
  id: number;
  name: string;
  emoji?: string;
  members: { userId: number; user: { id: number; name: string } }[];
  expenses?: {
    id: number;
    description: string;
    amount: number;
    paidById: number;
    paidBy?: { name: string };
    splits: { userId: number; amount: number }[];
    createdAt?: string;
  }[];
}

// ── AVATAR STACK ────────────────────────────────────────────────────────────
function AvatarStack({ members, max = 3 }: { members: { user: { name: string } }[], max?: number }) {
  const shown = members.slice(0, max);
  const extra = members.length - max;
  const colors = ["#7C3AED", "#A78BFA", "#6D28D9", "#8B5CF6"];
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((m, i) => (
        <div
          key={i}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: colors[i % colors.length],
            border: "2px solid white",
            marginLeft: i === 0 ? 0 : -8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "white",
            zIndex: shown.length - i,
          }}
        >
          {m.user.name.charAt(0).toUpperCase()}
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#EDE9FE", border: "2px solid white",
            marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "#7C3AED",
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

// ── BALANCE SUMMARY CARD ─────────────────────────────────────────────────────
function BalanceCard({ groups, currentUserId }: { groups: Group[], currentUserId: number }) {
  const youOwe = groups.reduce((sum, group) => {
    const expenses = group.expenses || [];
    const totalOwes = expenses.reduce((s, exp) => {
      const split = exp.splits.find(sp => sp.userId === currentUserId);
      return s + (split ? split.amount : 0);
    }, 0);
    const totalPaid = expenses.reduce((s, exp) => s + (exp.paidById === currentUserId ? exp.amount : 0), 0);
    return sum + Math.max(0, totalOwes - totalPaid);
  }, 0);

  const owedToYou = groups.reduce((sum, group) => {
    const expenses = group.expenses || [];
    const totalOwes = expenses.reduce((s, exp) => {
      const split = exp.splits.find(sp => sp.userId === currentUserId);
      return s + (split ? split.amount : 0);
    }, 0);
    const totalPaid = expenses.reduce((s, exp) => s + (exp.paidById === currentUserId ? exp.amount : 0), 0);
    return sum + Math.max(0, totalPaid - totalOwes);
  }, 0);

  const totalBalance = owedToYou - youOwe;
  const isPositive = totalBalance >= 0;

  return (
    <div style={{
      background: "#EDE9FE",
      borderRadius: 20,
      padding: "24px 20px",
      marginBottom: 24,
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
        Total Balance
      </p>
      <p style={{ fontSize: 38, fontWeight: 900, color: "#1a0533", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
        ₹{Math.abs(totalBalance).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
      </p>
      <p style={{ fontSize: 13, color: isPositive ? "#16a34a" : "#dc2626", fontWeight: 600, margin: "0 0 20px", display: "flex", alignItems: "center", gap: 4 }}>
        <span>{isPositive ? "↑" : "↓"}</span>
        {isPositive ? `You are owed ₹${owedToYou.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : `You owe ₹${youOwe.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "white", borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>You Owe</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#dc2626", margin: 0 }}>
            ₹{youOwe.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>Owed to You</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#7C3AED", margin: 0 }}>
            ₹{owedToYou.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── QUICK ADD MODAL ──────────────────────────────────────────────────────────
interface QuickAddModalProps {
  groups: Group[];
  currentUserId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

function QuickAddModal({ groups, currentUserId, onClose, onSuccess }: QuickAddModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState<number | "">(currentUserId || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const descRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => descRef.current?.focus(), 80); }, []);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const members = selectedGroup ? selectedGroup.members.map(m => m.user) : [];

  const handleSubmit = async () => {
    if (!selectedGroupId || !description.trim() || !amount || parseFloat(amount) <= 0 || !paidById) {
      setError("Please fill in all fields.");
      return;
    }
    const total = parseFloat(amount);
    if (members.length === 0) { setError("No members in group."); return; }

    const perPerson = Math.round((total / members.length) * 100) / 100;
    const splits = members.map((m, i) => {
      const rest = members.slice(0, -1).reduce((s) => s + perPerson, 0);
      return { userId: m.id, amount: i === members.length - 1 ? Math.round((total - rest) * 100) / 100 : perPerson };
    });

    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/groups/${selectedGroupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), amount: total, paidById: Number(paidById), splits }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); setSaving(false); return; }
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 900);
    } catch { setError("Network error."); setSaving(false); }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 520, padding: "8px 0 40px", boxShadow: "0 -8px 40px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 24px 16px" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: 0 }}>⚡ Quick Add</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>Equal split among all members</p>
          </div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: "50%", background: "#f1f5f9", border: "none", cursor: "pointer" }}>
            <X style={{ width: 18, height: 18, color: "#64748b" }} />
          </button>
        </div>

        {success ? (
          <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check style={{ width: 28, height: 28, color: "#16a34a" }} />
            </div>
            <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 16, margin: 0 }}>Expense added!</p>
          </div>
        ) : (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            {error && <div className="alert-error" style={{ margin: 0 }}>{error}</div>}

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Group</label>
              <select value={selectedGroupId} onChange={e => setSelectedGroupId(Number(e.target.value) || "")} className="quick-add-input-field-group">
                <option value="">Select a group...</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.emoji || ""} {g.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>What was it for?</label>
              <input ref={descRef} type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-field" placeholder="Dinner, Petrol, Movie tickets..." />
            </div>

            <div className="form-grid-2">
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Amount (₹)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", fontWeight: 700, fontSize: 16, pointerEvents: "none" }}>₹</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="quick-add-input-field-amount" style={{ paddingLeft: 32, fontSize: 18, fontWeight: 900 }} placeholder="0" step="0.01" min="0"
                    onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Paid by</label>
                <select value={paidById} onChange={e => setPaidById(Number(e.target.value) || "")} className="input-field">
                  <option value="">Select...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            {selectedGroup && members.length > 0 && amount && parseFloat(amount) > 0 && (
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Split preview</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {members.map(m => (
                    <span key={m.id} style={{ fontSize: 13, fontWeight: 600, color: "#334155", background: "white", padding: "3px 10px", borderRadius: 20, border: "1px solid #e2e8f0" }}>
                      {m.name.split(" ")[0]}: ₹{(parseFloat(amount) / members.length).toFixed(0)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleSubmit} disabled={saving} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4, fontSize: 15, padding: "13px 24px", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Adding..." : "Add Expense"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ONBOARDING CARD (shown when user has no groups) ───────────────────────────
function OnboardingCard() {
  const steps = [
    { num: 1, emoji: "👥", title: "Create a group", desc: "Add your flatmates, travel buddies, or anyone you share costs with." },
    { num: 2, emoji: "🧾", title: "Log an expense", desc: "Enter what you paid and SplitEase divides it up automatically." },
    { num: 3, emoji: "✅", title: "Settle up", desc: "See exactly who owes what and mark payments as done." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)", borderRadius: 24, padding: "28px 24px", color: "white", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px", color: "white" }}>Welcome to SplitEase!</h2>
        <p style={{ fontSize: 14, margin: 0, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>Split expenses with friends, family, and teammates — no awkward conversations needed.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>How it works</p>
        {steps.map((step, i) => (
          <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", background: "white", borderRadius: 16, border: "1.5px solid #EDE9FE", boxShadow: "0 1px 4px rgba(124,58,237,0.06)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {step.emoji}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#7C3AED", background: "#EDE9FE", borderRadius: 20, padding: "2px 8px" }}>Step {step.num}</span>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>{step.title}</p>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.4 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <Link href="/groups/new" className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 16, padding: "14px 24px" }}>
        <Plus size={20} />
        Create your first group
      </Link>
      <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", margin: "-8px 0 0" }}>You can invite others after the group is created</p>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const currentUserId = session?.user?.id ? parseInt(session.user.id as string) : null;

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/signin");
  }, [status]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchGroups();
  }, [status]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F8F5FF" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, border: "4px solid #EDE9FE", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#7C3AED", fontWeight: 600, fontSize: 15 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F8F5FF", minHeight: "100vh", paddingBottom: 96 }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/profile" style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 700, color: "white", textDecoration: "none",
            }}>
              {session?.user?.name?.charAt(0).toUpperCase() || "?"}
            </Link>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#7C3AED", letterSpacing: "-0.01em" }}>SplitEase</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ width: 38, height: 38, borderRadius: "50%", background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <Bell size={18} color="#64748b" />
            </button>
            <Link href="/profile" style={{ width: 38, height: 38, borderRadius: "50%", background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textDecoration: "none" }}>
              <Settings size={18} color="#64748b" />
            </Link>
          </div>
        </div>

        {/* ── BALANCE CARD ── */}
        {currentUserId && groups.length > 0 && (
          <BalanceCard groups={groups} currentUserId={currentUserId} />
        )}

        {/* ── CONTENT ── */}
        {groups.length === 0 ? (
          <OnboardingCard />
        ) : (
          <>
            {/* ── ACTIVE GROUPS ── */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Active Groups</h2>
                <Link href="/groups/new" style={{ fontSize: 13, fontWeight: 600, color: "#7C3AED", textDecoration: "none" }}>VIEW ALL</Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {groups.map(group => {
                  if (!currentUserId) return null;
                  const expenses = group.expenses || [];
                  const totalPaid = expenses.reduce((sum, exp) => sum + (exp.paidById === currentUserId ? exp.amount : 0), 0);
                  const totalOwes = expenses.reduce((sum, exp) => {
                    const split = exp.splits.find(s => s.userId === currentUserId);
                    return sum + (split ? split.amount : 0);
                  }, 0);
                  const balance = totalPaid - totalOwes;
                  const isOwed = balance > 0;
                  const isOwes = balance < 0;

                  return (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        background: "white", borderRadius: 16, padding: "14px 16px",
                        textDecoration: "none", color: "inherit",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                        border: "1px solid #F3F0FF",
                        transition: "box-shadow 0.2s",
                      }}
                    >
                      {/* Group emoji or initial */}
                      <div style={{
                        width: 46, height: 46, borderRadius: 14,
                        background: "#F3F0FF",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: group.emoji ? 22 : 18, fontWeight: 700,
                        color: group.emoji ? undefined : "#7C3AED",
                        flexShrink: 0,
                      }}>
                        {group.emoji || group.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Group info + avatar stack */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {group.name}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <AvatarStack members={group.members} max={3} />
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            {group.members.length} member{group.members.length !== 1 ? "s" : ""} · {expenses.length} {expenses.length === 1 ? "bill" : "bills"}
                          </span>
                        </div>
                      </div>

                      {/* Balance */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{
                          fontSize: 15, fontWeight: 800, margin: "0 0 2px",
                          color: isOwed ? "#7C3AED" : isOwes ? "#dc2626" : "#94a3b8",
                        }}>
                          {isOwes ? "-" : "+"}₹{Math.abs(balance).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 600, margin: 0, color: isOwed ? "#7C3AED" : isOwes ? "#dc2626" : "#94a3b8" }}>
                          {isOwed ? "Owed" : isOwes ? "Owes" : "Settled"}
                        </p>
                      </div>

                      <ChevronRight size={16} color="#d1d5db" style={{ flexShrink: 0, marginLeft: 4 }} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── NEW GROUP CTA ── */}
            <Link href="/groups/new" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "white", border: "2px dashed #DDD6FE", borderRadius: 16, padding: "14px",
              textDecoration: "none", color: "#7C3AED", fontWeight: 700, fontSize: 14,
              marginBottom: 24,
            }}>
              <Plus size={18} />
              Create New Group
            </Link>
          </>
        )}
      </div>

      {/* ── FAB ── */}
      {groups.length > 0 && (
        <button
          onClick={() => setShowQuickAdd(true)}
          style={{
            position: "fixed", bottom: 84, right: 20, zIndex: 100,
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
          }}
          title="Quick Add Expense"
        >
          <Plus size={26} color="white" />
        </button>
      )}

      {/* ── QUICK ADD MODAL ── */}
      {showQuickAdd && (
        <QuickAddModal
          groups={groups}
          currentUserId={currentUserId}
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => { setLoading(true); fetchGroups(); }}
        />
      )}

      {/* ── BOTTOM NAV ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "white", borderTop: "1px solid #F3F0FF",
        height: 68, display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50, boxShadow: "0 -4px 20px rgba(124,58,237,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "stretch", justifyContent: "space-around", width: "100%", maxWidth: 520, height: "100%" }}>
          {[
            { href: "/", icon: <Users size={22} />, label: "Groups", active: true },
            { href: "/expenses", icon: <Wallet size={22} />, label: "Friends", active: false },
            { href: "/expenses", icon: <Activity size={22} />, label: "Activity", active: false },
            { href: "/profile", icon: <User size={22} />, label: "Account", active: false },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 3, flex: 1, textDecoration: "none", padding: "8px 0",
                color: item.active ? "#7C3AED" : "#94a3b8",
                borderTop: item.active ? "2px solid #7C3AED" : "2px solid transparent",
                transition: "color 0.2s",
              }}
            >
              {item.icon}
              <span style={{ fontSize: 10, fontWeight: item.active ? 700 : 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
