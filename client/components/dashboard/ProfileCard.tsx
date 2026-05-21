"use client";

import { useEffect, useState } from "react";
import { MapPin, Link as LinkIcon, Users, Building, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

interface GitHubProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  htmlUrl: string;
}

export function ProfileCard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.dashboard.githubProfile()
      .then((data) => { if (mounted) setProfile(data.profile); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-64 h-64 rounded-full bg-white/[0.04] animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-40 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-4 w-28 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-3 w-56 bg-white/[0.04] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const p = profile;

  return (
    <div className="space-y-5">
      <a
        href={p?.htmlUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        {p?.avatarUrl ? (
          <img
            src={p.avatarUrl}
            alt={p.login}
            className="w-48 h-48 rounded-full border-2 border-white/10 object-cover transition-opacity group-hover:opacity-80 shadow-lg"
          />
        ) : user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-48 h-48 rounded-full border-2 border-white/10 object-cover transition-opacity group-hover:opacity-80 shadow-lg"
          />
        ) : (
          <div className="flex w-48 h-48 items-center justify-center rounded-full bg-white/[0.06] text-4xl font-semibold text-neutral-300">
            {user?.username?.slice(0, 2).toUpperCase() || "?"}
          </div>
        )}
      </a>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">{p?.name || user?.username || "Guest"}</h1>
        <p className="text-base text-neutral-500">@{p?.login || user?.username}</p>
      </div>

      {p?.bio && (
        <p className="text-sm text-neutral-400 leading-relaxed">{p.bio}</p>
      )}

      <div className="space-y-2 text-sm text-neutral-500">
        {p?.company && (
          <span className="flex items-center gap-2">
            <Building size={15} className="shrink-0" />
            {p.company}
          </span>
        )}
        {p?.location && (
          <span className="flex items-center gap-2">
            <MapPin size={15} className="shrink-0" />
            {p.location}
          </span>
        )}
        {p?.blog && (
          <a
            href={p.blog.startsWith("http") ? p.blog : `https://${p.blog}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-neutral-300 transition-colors"
          >
            <LinkIcon size={15} className="shrink-0" />
            <span className="truncate">{p.blog.replace(/^https?:\/\//, "")}</span>
          </a>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <a
          href={`${p?.htmlUrl || "#"}?tab=followers`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors"
        >
          <Users size={15} className="text-neutral-500" />
          <span className="font-semibold text-white">{p?.followers}</span>
          <span className="text-neutral-500">followers</span>
        </a>
        <span className="flex items-center gap-1.5">
          <Users size={15} className="text-neutral-500" />
          <span className="font-semibold text-white">{p?.following}</span>
          <span className="text-neutral-500">following</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={p?.htmlUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.08] transition-colors"
        >
          <ExternalLink size={14} />
          Follow on GitHub
        </a>
      </div>
    </div>
  );
}
