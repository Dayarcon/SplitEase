"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, CheckCircle2, Receipt, StickyNote, Camera, X, ImageIcon } from "lucide-react";

interface Member {
  id: number;
  name: string;
}

const getInitials = (name: string) => name.charAt(0).toUpperCase();

const CATEGORIES = [
  { id: 'food', emoji: '🍽️', label: 'Food' },
  { id: 'transport', emoji: '🚗', label: 'Transport' },
  { id: 'housing', emoji: '🏠', label: 'Housing' },
  { id: 'entertainment', emoji: '🎉', label: 'Fun' },
  { id: 'shopping', emoji: '🛒', label: 'Shopping' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
  { id: 'health', emoji: '💊', label: 'Health' },
  { id: 'utilities', emoji: '🔧', label: 'Utilities' },
  { id: 'other', emoji: '💡', label: 'Other' },
];

const detectCategory = (desc: string): string => {
  const d = desc.toLowerCase();
  if (/dinner|lunch|breakfast|food|restaurant|cafe|pizza|burger|sushi|biryani|chai|coffee|eat|drink|bar|pub/.test(d)) return 'food';
  if (/uber|taxi|auto|cab|bus|metro|train|fuel|petrol|gas|parking|toll|flight|ola/.test(d)) return 'transport';
  if (/hotel|rent|apartment|house|pg|hostel|airbnb|accommodation/.test(d)) return 'housing';
  if (/movie|concert|game|party|club|event|show|ticket|netflix|spotify/.test(d)) return 'entertainment';
  if (/amazon|shopping|grocery|mall|shop|buy|purchase|market|supermarket/.test(d)) return 'shopping';
  if (/trip|tour|travel|holiday|vacation|trek|beach|resort/.test(d)) return 'travel';
  if (/doctor|medicine|pharmacy|hospital|health|gym|fitness/.test(d)) return 'health';
  if (/electricity|water|wifi|internet|phone|bill|utility/.test(d)) return 'utilities';
  return 'other';
};

const AVATAR_COLORS = [
  { background: '#e0e7ff', color: '#7C3AED', borderColor: '#C4B5FD' },
  { background: '#ffe4e6', color: '#be123c', borderColor: '#fecdd3' },
  { background: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' },
  { background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' },
  { background: '#f3e8ff', color: '#7e22ce', borderColor: '#e9d5ff' },
  { background: '#cffafe', color: '#155e75', borderColor: '#a5f3fc' },
];

const getAvatarStyle = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

export default function NewExpenseWizard() {
  const router = useRouter();
  const routeParams = useParams();
  const groupId = parseInt(routeParams.id as string);

  const [step, setStep] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState<number | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [splits, setSplits] = useState<{ [userId: number]: number }>({});
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("other");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [splitMode, setSplitMode] = useState<'amount' | 'percent'>('amount');
  const [percentages, setPercentages] = useState<{ [userId: number]: number }>({});
  const [showAdvancedSplit, setShowAdvancedSplit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState("");
  const [containerSize, setContainerSize] = useState(320);

  useEffect(() => {
    setContainerSize(Math.min(320, window.innerWidth - 48));
    const handleResize = () => setContainerSize(Math.min(320, window.innerWidth - 48));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      if (Number.isNaN(groupId)) {
        setError("Invalid group id");
        setLoadingMembers(false);
        return;
      }
      try {
        const res = await fetch(`/api/groups/${groupId}`);
        if (!res.ok) throw new Error("Failed to fetch group");
        const data = await res.json();
        setMembers(data.members.map((m: any) => m.user));
      } catch (err) {
        setError("Failed to load group members");
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [groupId]);

  const uploadReceipt = async (file: File) => {
    setUploadingReceipt(true);
    // Local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setReceiptPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setReceiptUrl(data.url);
      } else {
        setError(data.error || "Upload failed");
        setReceiptPreview(null);
      }
    } catch {
      setError("Upload failed. Please try again.");
      setReceiptPreview(null);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const splitTotal = Object.values(splits).reduce((sum, val) => sum + val, 0);

  const distributeEqual = () => {
    const total = parseFloat(amount) || 0;
    if (total <= 0 || selectedMemberIds.length === 0) return;

    const newSplits: { [userId: number]: number } = {};
    const totalCents = Math.round(total * 100);
    const baseCents = Math.floor(totalCents / selectedMemberIds.length);
    const remainderCents = totalCents - baseCents * selectedMemberIds.length;

    selectedMemberIds.forEach((id, idx) => {
      const cents = baseCents + (idx < remainderCents ? 1 : 0);
      newSplits[id] = cents / 100;
    });
    setSplits(newSplits);

    // Also set equal percentages
    const pct = Math.floor(100 / selectedMemberIds.length);
    const remPct = 100 - pct * selectedMemberIds.length;
    const newPcts: { [userId: number]: number } = {};
    selectedMemberIds.forEach((id, idx) => {
      newPcts[id] = pct + (idx < remPct ? 1 : 0);
    });
    setPercentages(newPcts);
  };

  const applyPercentages = () => {
    const total = parseFloat(amount) || 0;
    const newSplits: { [userId: number]: number } = {};
    selectedMemberIds.forEach(id => {
      const pct = percentages[id] || 0;
      newSplits[id] = Math.round(total * pct) / 100;
    });
    setSplits(newSplits);
  };

  useEffect(() => {
    if (step === 3 && Object.keys(splits).length === 0) {
      distributeEqual();
    }
  }, [step, selectedMemberIds, amount]);

  const toggleMemberSelection = (id: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const goToStep2 = () => {
    if (!description || !amount || parseFloat(amount) <= 0 || !paidById) {
      setError("Please fill all fields correctly.");
      return;
    }
    setError("");
    setStep(2);
  };

  const goToStep3 = () => {
    if (selectedMemberIds.length === 0) {
      setError("Select at least one member to split with.");
      return;
    }
    setError("");
    distributeEqual();
    setStep(3);
  };

  const createExpense = async () => {
    const numAmount = parseFloat(amount);
    if (Math.abs(splitTotal - numAmount) > 0.01) {
      setError(`Split total (₹${splitTotal.toFixed(2)}) must equal amount (₹${numAmount.toFixed(2)})`);
      return;
    }

    const expenseSplits = selectedMemberIds
      .map((id) => ({
        userId: id,
        amount: Math.round((splits[id] || 0) * 100) / 100,
      }))
      .filter((s) => s.amount > 0);

    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: numAmount,
          paidById,
          splits: expenseSplits,
          notes: notes.trim() || null,
          category,
          receiptUrl: receiptUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create expense");
        setLoading(false);
        return;
      }
      router.push(`/groups/${groupId}`);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (loadingMembers) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F8F5FF" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, border: "4px solid #EDE9FE", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#7C3AED", fontWeight: 600, fontSize: 15 }}>Loading...</p>
        </div>
      </div>
    );
  }

  const TopBar = ({ title, showBackToGroups = false }: { title: string; showBackToGroups?: boolean }) => (
    <div style={{ background: "white", borderBottom: "1px solid #F3F0FF", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(124,58,237,0.06)" }}>
      <button
        onClick={() => {
          if (showBackToGroups) router.push(`/groups/${groupId}`);
          else setStep(prev => prev - 1);
        }}
        style={{ width: 36, height: 36, borderRadius: "50%", background: "#F3F0FF", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <X style={{ width: 18, height: 18, color: "#7C3AED" }} />
      </button>
      <h1 style={{ fontWeight: 900, fontSize: 18, color: "#0f172a", margin: 0 }}>{title}</h1>
      <button
        onClick={step === 3 ? createExpense : (step === 2 ? goToStep3 : goToStep2)}
        disabled={loading}
        style={{ padding: "8px 18px", borderRadius: 20, background: "#7C3AED", color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1 }}
      >
        {step === 3 ? (loading ? "Saving..." : "Save") : "Next"}
      </button>
    </div>
  );

  const MerchantHeader = () => (
    <div style={{ background: "#EDE9FE", margin: "16px", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
          Paid for {description || "Expense"}
        </p>
        <p style={{ fontSize: 24, fontWeight: 900, color: "#1a0533", margin: 0 }}>₹{(parseFloat(amount) || 0).toFixed(2)}</p>
      </div>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Receipt style={{ width: 22, height: 22, color: "white" }} />
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "10px 0" }}>
      {[1, 2, 3].map(s => (
        <div key={s} style={{
          width: step === s ? 24 : 8, height: 8, borderRadius: 4,
          background: step === s ? "#7C3AED" : step > s ? "#C4B5FD" : "#E9D5FF",
          transition: "all 0.2s ease",
        }} />
      ))}
    </div>
  );

  return (
    <div style={{ background: "#F8F5FF", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ═══════════════ STEP 1: DETAILS ═══════════════ */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: 96 }}>
          <TopBar title="Add Expense" showBackToGroups={true} />
          <StepIndicator />

          {error && (
            <div className="alert-error" style={{ margin: '8px 24px' }}>{error}</div>
          )}

          <div style={{ padding: '16px 24px', flex: 1, maxWidth: 520, width: '100%', margin: '0 auto' }}>
            <div className="card card-lg" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (e.target.value.trim()) setCategory(detectCategory(e.target.value));
                  }}
                  className="input-field"
                  placeholder="Burger King, Hotel, Petrol..."
                  autoFocus
                />
              </div>

              {/* Category Picker */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                        borderRadius: 20, border: `2px solid ${category === cat.id ? '#7C3AED' : '#e2e8f0'}`,
                        background: category === cat.id ? '#EDE9FE' : 'white',
                        cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        color: category === cat.id ? '#7C3AED' : '#64748b',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontWeight: 700, fontSize: 18, pointerEvents: 'none' }}>₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 24, fontWeight: 900, paddingLeft: 36 }}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Who Paid?</label>
                <select
                  value={paidById || ""}
                  onChange={(e) => setPaidById(parseInt(e.target.value))}
                  className="input-field"
                >
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  Notes <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  style={{ minHeight: 72, resize: 'none', lineHeight: 1.5 }}
                  placeholder="Add a note, receipt number, or reminder..."
                />
              </div>

              {/* Receipt Upload */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  Receipt Photo <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
                </label>
                {receiptPreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, border: '2px solid #e2e8f0' }}
                    />
                    {uploadingReceipt && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 13, color: '#7C3AED', fontWeight: 600 }}>Uploading...</div>
                      </div>
                    )}
                    {!uploadingReceipt && receiptUrl && (
                      <button
                        type="button"
                        onClick={() => { setReceiptUrl(null); setReceiptPreview(null); }}
                        style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    )}
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 16px', borderRadius: 12, border: '2px dashed #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>
                    <Camera style={{ width: 24, height: 24, color: '#94a3b8' }} />
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Tap to upload receipt</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>JPG, PNG, WebP · Max 5MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadReceipt(file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 24, background: 'linear-gradient(to top, #f8f5ff 70%, transparent)', zIndex: 20 }}>
            <button onClick={goToStep2} className="btn-primary" style={{ width: '100%', padding: '14px 24px', fontSize: 16, justifyContent: 'center', maxWidth: 520, margin: '0 auto', display: 'flex' }}>
              Select Members
              <ChevronRight style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP 2: MEMBER SELECTION ═══════════════ */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 96 }}>
          <TopBar title="Who's Splitting?" />
          <StepIndicator />
          <MerchantHeader />

          {error && (
            <div className="alert-error" style={{ margin: '8px 24px' }}>{error}</div>
          )}

          {/* Select all / none quick actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px 4px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: 0 }}>
              {selectedMemberIds.length} of {members.length} selected
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setSelectedMemberIds(members.map(m => m.id))}
                style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', background: '#EDE9FE', border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer' }}
              >
                All
              </button>
              <button
                onClick={() => setSelectedMemberIds([])}
                style={{ fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer' }}
              >
                None
              </button>
            </div>
          </div>

          {/* Member list */}
          <div style={{ flex: 1, padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
            {members.map((member) => {
              const isSelected = selectedMemberIds.includes(member.id);
              const avatarStyle = getAvatarStyle(member.id);

              return (
                <div
                  key={member.id}
                  onClick={() => toggleMemberSelection(member.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    borderRadius: 16,
                    cursor: 'pointer',
                    background: isSelected ? avatarStyle.background : '#ffffff',
                    border: `2px solid ${isSelected ? avatarStyle.borderColor : '#e2e8f0'}`,
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(79,70,229,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: isSelected ? avatarStyle.background : '#f1f5f9',
                    border: `2px solid ${isSelected ? avatarStyle.borderColor : '#e2e8f0'}`,
                    color: isSelected ? avatarStyle.color : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18,
                    flexShrink: 0,
                  }}>
                    {getInitials(member.name)}
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1e293b' : '#475569' }}>
                      {member.name}
                    </p>
                    {member.id === paidById && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: '#7C3AED' }}>Paid by this person</p>
                    )}
                  </div>

                  {/* Checkbox */}
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? '#22c55e' : '#cbd5e1'}`,
                    background: isSelected ? '#22c55e' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}>
                    {isSelected && (
                      <CheckCircle2 style={{ width: 16, height: 16, color: 'white', strokeWidth: 3 }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 24, background: 'linear-gradient(to top, #f8f5ff 70%, transparent)', zIndex: 20 }}>
            <button onClick={goToStep3} className="btn-primary" style={{ width: '100%', padding: '14px 24px', fontSize: 16, justifyContent: 'center', maxWidth: 520, margin: '0 auto', display: 'flex' }}>
              Assign Amounts
              <ChevronRight style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP 3: SPLIT AMOUNTS ═══════════════ */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 120 }}>
          <TopBar title="Split Amounts" />
          <StepIndicator />
          <MerchantHeader />

          {error && (
            <div className="alert-error" style={{ margin: '8px 24px' }}>{error}</div>
          )}

          {/* Advanced split toggle — hidden by default */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 24px 0' }}>
            <button
              onClick={() => {
                setShowAdvancedSplit(v => !v);
                if (showAdvancedSplit) setSplitMode('amount');
              }}
              style={{ fontSize: 12, fontWeight: 700, color: showAdvancedSplit ? '#be123c' : '#7C3AED', background: showAdvancedSplit ? '#fee2e2' : '#EDE9FE', border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer' }}
            >
              {showAdvancedSplit ? '✕ Simple split' : '⚙️ Custom split'}
            </button>
          </div>

          {showAdvancedSplit && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 24px 0' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, gap: 4 }}>
                <button
                  onClick={() => setSplitMode('amount')}
                  style={{ padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: splitMode === 'amount' ? '#7C3AED' : 'transparent', color: splitMode === 'amount' ? 'white' : '#64748b', transition: 'all 0.2s' }}
                >₹ Amount</button>
                <button
                  onClick={() => setSplitMode('percent')}
                  style={{ padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: splitMode === 'percent' ? '#7C3AED' : 'transparent', color: splitMode === 'percent' ? 'white' : '#64748b', transition: 'all 0.2s' }}
                >% Split</button>
              </div>
            </div>
          )}

          <div style={{ flex: 1, padding: '24px 16px 16px', maxWidth: 600, width: '100%', margin: '0 auto' }}>
            {splitMode === 'amount' ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: selectedMemberIds.length > 4 ? 8 : selectedMemberIds.length > 3 ? 12 : 20, height: 280 }}>
                {selectedMemberIds.map((id) => {
                  const member = members.find(m => m.id === id)!;
                  const currentSplit = splits[id] || 0;
                  const totalAmount = parseFloat(amount) || 1;
                  const pct = Math.min(100, Math.max(0, (currentSplit / totalAmount) * 100));
                  const avatarStyle = getAvatarStyle(member.id);

                  return (
                    <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'space-between', flex: 1, maxWidth: 80, minWidth: 0 }}>
                      <div style={{ textAlign: 'center', marginBottom: 8, width: '100%' }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                          {member.name.split(' ')[0]}
                        </p>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${avatarStyle.borderColor}`, background: avatarStyle.background, color: avatarStyle.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, margin: '0 auto' }}>
                          {getInitials(member.name)}
                        </div>
                      </div>
                      <div style={{ position: 'relative', width: 6, background: '#e0e7ff', borderRadius: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', margin: '0 auto 12px' }}>
                        <div style={{ width: '100%', background: '#7C3AED', borderRadius: 3, height: `${pct}%`, transition: 'height 0.3s ease' }} />
                        <div style={{ position: 'absolute', width: 20, height: 20, background: 'white', border: '2px solid #7C3AED', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', bottom: `calc(${pct}% - 10px)`, left: -7, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                          <div style={{ width: 5, height: 2, background: '#C4B5FD', borderRadius: 1 }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <input
                          type="number"
                          style={{ width: '100%', textAlign: 'center', fontSize: 12, fontWeight: 700, background: 'transparent', border: 'none', borderBottom: '2px solid #C4B5FD', outline: 'none', padding: '4px 2px', color: '#1e293b' }}
                          value={currentSplit === 0 ? "" : currentSplit}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setSplits(prev => ({ ...prev, [id]: val }));
                          }}
                          step="0.01"
                          onFocus={e => (e.target as HTMLInputElement).style.borderBottomColor = '#7C3AED'}
                          onBlur={e => (e.target as HTMLInputElement).style.borderBottomColor = '#C4B5FD'}
                        />
                        <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>₹</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Percentage mode */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedMemberIds.map((id) => {
                  const member = members.find(m => m.id === id)!;
                  const pct = percentages[id] || 0;
                  const totalAmount = parseFloat(amount) || 0;
                  const derived = Math.round(totalAmount * pct) / 100;
                  const avatarStyle = getAvatarStyle(member.id);
                  const totalPct = Object.values(percentages).reduce((s, v) => s + v, 0);

                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 16, background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${avatarStyle.borderColor}`, background: avatarStyle.background, color: avatarStyle.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                        {getInitials(member.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{member.name.split(' ')[0]}</p>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={pct}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            setPercentages(prev => ({ ...prev, [id]: val }));
                          }}
                          style={{ width: '100%', accentColor: '#7C3AED' }}
                        />
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 64 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={pct === 0 ? "" : pct}
                            onChange={e => {
                              const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                              setPercentages(prev => ({ ...prev, [id]: val }));
                            }}
                            style={{ width: 44, textAlign: 'center', fontSize: 15, fontWeight: 900, color: '#7C3AED', border: 'none', borderBottom: '2px solid #C4B5FD', background: 'transparent', outline: 'none', padding: '2px 0' }}
                          />
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#7C3AED' }}>%</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0', fontWeight: 600 }}>₹{derived.toFixed(0)}</p>
                      </div>
                    </div>
                  );
                })}
                {/* % total indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: (() => { const t = Object.values(percentages).reduce((s,v)=>s+v,0); return t === 100 ? '#f0fdf4' : '#fff7ed'; })(), border: `1.5px solid ${(() => { const t = Object.values(percentages).reduce((s,v)=>s+v,0); return t === 100 ? '#bbf7d0' : '#fed7aa'; })()}` }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>Total: {Object.values(percentages).reduce((s,v)=>s+v,0)}%</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { applyPercentages(); }} style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', background: '#EDE9FE', padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                      Apply
                    </button>
                    <button onClick={() => { distributeEqual(); }} style={{ fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                      Equal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Total / Equal Split (for amount mode) */}
            {splitMode === 'amount' && (
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <p style={{ color: '#64748b', margin: 0 }}>
                  Total: <span style={{ fontWeight: 900, color: '#0f172a' }}>₹{splitTotal.toFixed(2)}</span> / ₹{parseFloat(amount).toFixed(2)}
                </p>
                <button onClick={distributeEqual} style={{ color: '#7C3AED', fontWeight: 700, background: '#EDE9FE', padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  Equal Split
                </button>
              </div>
            )}
          </div>

          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 24, background: 'linear-gradient(to top, #f8f5ff 70%, transparent)', zIndex: 20 }}>
            <button
              onClick={createExpense}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px 24px', fontSize: 16, justifyContent: 'center', maxWidth: 520, margin: '0 auto', display: 'flex' }}
            >
              {loading ? (
                <>
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Creating...
                </>
              ) : (
                'Create Expense ✓'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
