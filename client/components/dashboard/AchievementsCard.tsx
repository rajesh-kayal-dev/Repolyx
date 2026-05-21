"use client";

import { useEffect, useState } from "react";
import { Star, Users, UserPlus, BookOpen, Award, ExternalLink, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";

interface AchievementBadge {
  title: string;
  imageUrl: string;
  achieved: boolean;
}

interface GitHubBadge {
  label: string;
  icon: any;
  value: string | number;
  subtitle: string;
  color: string;
  bgColor: string;
}

const ACHIEVEMENT_TIER_COLORS: Record<string, string> = {
  "Pull Shark": "from-purple-500/20 to-purple-600/10 border-purple-500/20",
  "Quickdraw": "from-orange-500/20 to-orange-600/10 border-orange-500/20",
  "Starstruck": "from-yellow-500/20 to-yellow-600/10 border-yellow-500/20",
  "Galaxy Brain": "from-blue-500/20 to-blue-600/10 border-blue-500/20",
  "Pair Extraordinaire": "from-pink-500/20 to-pink-600/10 border-pink-500/20",
  "Arctic Code Vault": "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20",
  "Public Sponsor": "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20",
  "Mars 2020": "from-red-500/20 to-red-600/10 border-red-500/20",
  "YOLO": "from-rose-500/20 to-rose-600/10 border-rose-500/20",
};

export function AchievementsCard() {
  const [badges, setBadges] = useState<GitHubBadge[]>([]);
  const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.dashboard.githubProfile().catch(() => null),
      api.dashboard.achievements().catch(() => null),
    ]).then(([profileRes, achievementsRes]) => {
      if (!mounted) return;

      if (profileRes) {
        const p = profileRes.profile;
        const items: GitHubBadge[] = [];

        if (p.totalStars > 0) {
          items.push({
            label: "Total Stars",
            icon: Star,
            value: p.totalStars.toLocaleString(),
            subtitle: "stars across all repos",
            color: "text-yellow-400",
            bgColor: "bg-yellow-400/10",
          });
        }

        if (p.followers > 0) {
          items.push({
            label: "Followers",
            icon: Users,
            value: p.followers.toLocaleString(),
            subtitle: "GitHub followers",
            color: "text-blue-400",
            bgColor: "bg-blue-400/10",
          });
        }

        if (p.following > 0) {
          items.push({
            label: "Following",
            icon: UserPlus,
            value: p.following.toLocaleString(),
            subtitle: "users followed",
            color: "text-purple-400",
            bgColor: "bg-purple-400/10",
          });
        }

        if (p.publicRepos > 0) {
          items.push({
            label: "Public Repos",
            icon: BookOpen,
            value: p.publicRepos.toLocaleString(),
            subtitle: "public repositories",
            color: "text-emerald-400",
            bgColor: "bg-emerald-400/10",
          });
        }

        items.push({
          label: "GitHub Profile",
          icon: Award,
          value: `@${p.login}`,
          subtitle: p.name || p.login,
          color: "text-cyan-400",
          bgColor: "bg-cyan-400/10",
        });

        setBadges(items);
      }

      if (achievementsRes?.achievements) {
        setAchievements(achievementsRes.achievements);
      }
      setAchievementsLoading(false);
      setLoading(false);
    }).catch(() => {
      if (mounted) {
        setLoading(false);
        setAchievementsLoading(false);
        setError("Failed to load data");
      }
    });

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-5">
        <div className="h-4 w-36 bg-white/[0.04] rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && badges.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-5">
        <div className="flex items-center gap-2 text-neutral-500 mb-3">
          <Award size={15} />
          <span className="text-xs font-semibold uppercase tracking-wider">GitHub Achievements</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <AlertCircle size={14} />
          <span>Unable to load GitHub data.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-5">
      <div className="flex items-center gap-2 text-neutral-500 mb-4">
        <Award size={15} />
        <span className="text-xs font-semibold uppercase tracking-wider">GitHub Achievements</span>
        {achievements.length > 0 && (
          <span className="text-[10px] text-neutral-600 ml-auto">
            {achievements.length} badge{achievements.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {achievements.length > 0 && (
        <div className="mb-5">
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <div
                key={a.title}
                className={`group relative flex items-center gap-2 rounded-lg border bg-gradient-to-r p-2.5 transition-all hover:scale-105 ${ACHIEVEMENT_TIER_COLORS[a.title] || "from-white/[0.04] to-white/[0.02] border-white/[0.08]"}`}
                title={a.title}
              >
                <div className="w-8 h-8 rounded-md bg-white/[0.04] flex items-center justify-center overflow-hidden">
                  {a.imageUrl ? (
                    <img
                      src={a.imageUrl}
                      alt={a.title}
                      className="w-6 h-6 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <Award size={16} className="text-neutral-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate max-w-[100px]">
                    {a.title}
                  </div>
                  <div className="text-[10px] text-neutral-500">Achievement</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length === 0 && !achievementsLoading && (
        <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
          <p className="text-xs text-neutral-500">
            No achievement badges found. Achievements like Pull Shark, Quickdraw, and others appear after completing specific actions on GitHub.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.label}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${b.bgColor}`}>
                <Icon size={20} className={b.color} />
              </div>
              <div className="min-w-0">
                <div className={`text-lg font-bold ${b.color}`}>{b.value}</div>
                <div className="text-[11px] text-neutral-500 truncate">{b.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}