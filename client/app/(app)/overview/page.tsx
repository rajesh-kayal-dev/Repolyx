"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { ReadmePreview } from "@/components/dashboard/ReadmePreview";
import { AchievementsCard } from "@/components/dashboard/AchievementsCard";
import { ContributionGraph } from "@/components/dashboard/ContributionGraph";
import { WorkspaceInsights } from "@/components/dashboard/WorkspaceInsights";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { RepoHealth } from "@/components/dashboard/RepoHealth";
import { ExternalLink, User, BookOpen, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const TABS = [
  { id: "Profile", label: "Profile", icon: User },
  { id: "README", label: "README", icon: BookOpen },
] as const;

export default function OverviewPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Profile");
  const [contributionFailed, setContributionFailed] = useState(false);
  const githubProfileUrl = user?.username ? `https://github.com/${user.username}` : "https://github.com";

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all rounded-t-lg ${
                isActive
                  ? "text-white bg-white/[0.04]"
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02]"
              }`}
            >
              <Icon size={15} className={isActive ? "text-accent" : "text-neutral-500 group-hover:text-neutral-300"} />
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "Profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="grid gap-8 lg:grid-cols-[240px_1fr]"
          >
            <div className="space-y-6">
              <div className="sticky top-24">
                <ProfileCard />
              </div>
            </div>
            <div className="min-w-0 space-y-8">
              {contributionFailed ? (
                <ReadmePreview />
              ) : (
                <>
                  <ContributionGraph onFetchError={() => setContributionFailed(true)} />
                  <AchievementsCard />
                </>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === "README" && (
          <motion.div
            key="readme"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ReadmePreview />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Common sections */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-6 w-1 rounded-full bg-accent" />
          <h2 className="text-sm font-semibold text-white">Workspace Insights</h2>
          <span className="text-xs text-neutral-500">Scanning and analysis metrics</span>
        </div>
        <WorkspaceInsights />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-6 w-1 rounded-full bg-accent" />
            <h2 className="text-sm font-semibold text-white">Activity</h2>
          </div>
          <ActivityFeed />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-6 w-1 rounded-full bg-accent" />
            <h2 className="text-sm font-semibold text-white">Health</h2>
          </div>
          <RepoHealth />
        </div>
      </div>

      {/* Go to GitHub Profile */}
      <div className="flex justify-center pb-8">
        <a
          href={githubProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-xl border border-white/[0.1] bg-gradient-to-r from-white/[0.04] to-white/[0.02] px-8 py-4 text-sm font-semibold text-white hover:from-white/[0.08] hover:to-white/[0.04] hover:border-accent/30 transition-all shadow-sm hover:shadow-[0_0_30px_rgba(56,189,248,0.08)]"
        >
          <ExternalLink size={16} className="text-neutral-400 group-hover:text-accent transition-colors" />
          <span>Go to GitHub Profile</span>
          <ChevronRight size={14} className="text-neutral-500 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
        </a>
      </div>
    </div>
  );
}
