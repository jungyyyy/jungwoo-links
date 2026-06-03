"use client";

import { useState } from "react";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";
import { LinksSection } from "@/components/admin/LinksSection";
import { ProfileSection } from "@/components/admin/ProfileSection";
import { SectionsSection } from "@/components/admin/SectionsSection";

type Tab = "profile" | "links" | "sections" | "analytics";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "links", label: "Links" },
  { id: "sections", label: "Sections" },
  { id: "analytics", label: "Analytics" },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              View site
            </a>
            <button
              onClick={handleLogout}
              className="admin-btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {activeTab === "profile" && <ProfileSection />}
        {activeTab === "links" && <LinksSection />}
        {activeTab === "sections" && <SectionsSection />}
        {activeTab === "analytics" && <AnalyticsSection />}
      </main>
    </div>
  );
}
