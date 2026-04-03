"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const PURPLE = "#7C3AED";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function LayoutIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function UsersIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function FriendsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
function BellIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function LogOutIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
    </svg>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: <LayoutIcon /> },
    { href: "/groups", label: "Groups", icon: <UsersIcon /> },
    { href: "/expenses", label: "Expenses", icon: <WalletIcon /> },
    { href: "/activity", label: "Activity", icon: <BellIcon /> },
    { href: "/profile", label: "Profile", icon: <UserIcon /> },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: 240,
      minHeight: "100vh",
      background: "#fff",
      borderRight: "1px solid #F3F0FF",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 40,
      boxShadow: "2px 0 12px rgba(124,58,237,0.05)",
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #7C3AED, #5B21B6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>S</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 19, color: PURPLE, letterSpacing: "-0.3px" }}>SplitEase</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "1.2px", paddingLeft: 44 }}>
          PREMIUM LEDGER
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 12,
                textDecoration: "none",
                background: active ? "#EDE9FE" : "transparent",
                color: active ? PURPLE : "#64748b",
                fontWeight: active ? 700 : 500,
                fontSize: 14,
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ color: active ? PURPLE : "#94a3b8", flexShrink: 0 }}>{item.icon}</span>
              {item.label}
              {active && (
                <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: PURPLE }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign Out */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid #F3F0FF" }}>
        {session?.user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 4, borderRadius: 12, background: "#FAFAFA" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #5B21B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0 }}>
              {session.user.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.name}
              </p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "9px 14px", borderRadius: 12,
            background: "none", border: "none", cursor: "pointer",
            color: "#94a3b8", fontSize: 14, fontWeight: 500,
          }}
        >
          <LogOutIcon />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

/** Wraps page content in a desktop sidebar layout + mobile bottom nav */
export function AppShell({
  children,
  activeTab,
}: {
  children: React.ReactNode;
  activeTab?: "dashboard" | "groups" | "expenses" | "activity" | "profile";
}) {
  return (
    <>
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Main content — offset by sidebar on desktop */}
      <div style={{ paddingBottom: 80 }} className="lg:pl-[240px] lg:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Nav — hidden on desktop */}
      <MobileBottomNav activeTab={activeTab} />
    </>
  );
}

function MobileBottomNav({ activeTab }: { activeTab?: string }) {
  const tabs = [
    { key: "dashboard", href: "/", emoji: "🏠", label: "HOME" },
    { key: "expenses",  href: "/expenses", emoji: "💳", label: "EXPENSES" },
    { key: "groups",    href: "/groups",   emoji: "👥", label: "GROUPS" },
    { key: "activity",  href: "/activity", emoji: "🔔", label: "ACTIVITY" },
    { key: "profile",   href: "/profile",  emoji: "👤", label: "ACCOUNT" },
  ];

  return (
    <nav
      className="lg:hidden"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "white", borderTop: "1px solid #F3F0FF",
        height: 68, display: "flex", alignItems: "stretch",
        zIndex: 50, boxShadow: "0 -4px 20px rgba(124,58,237,0.08)",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 3, textDecoration: "none",
              color: active ? PURPLE : "#94a3b8",
              borderTop: active ? `2px solid ${PURPLE}` : "2px solid transparent",
            }}
          >
            <span style={{ fontSize: 18 }}>{tab.emoji}</span>
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: "0.05em" }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
