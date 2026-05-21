import { ApifyClient } from "apify-client";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";

let client = null;

function getClient() {
  if (!client) {
    client = new ApifyClient({ token: env.APIFY_API_KEY });
  }
  return client;
}

export const apifyService = {
  async fetchGitHubProfile(username) {
    try {
      const c = getClient();
      const input = { usernames: [username], includeRepos: false };
      const run = await c.actor("knotless_cadence/github-profile-scraper").call(input);
      const { items } = await c.dataset(run.defaultDatasetId).listItems();
      if (items && items.length > 0) {
        return items[0];
      }
      return null;
    } catch (error) {
      logger.error("Apify profile fetch error:", error.message);
      return null;
    }
  },

  async fetchGitHubAchievements(username) {
    try {
      const url = `https://github.com/users/${username}/achievements`;
      const response = await fetch(url, {
        headers: {
          Accept: "text/html",
          "User-Agent": "Repolyx/1.0",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        logger.warn(`Achievements page returned ${response.status}`);
        return [];
      }

      const html = await response.text();

      const knownAchievements = [
        "Pull Shark", "Quickdraw", "Starstruck", "Galaxy Brain",
        "Pair Extraordinaire", "Arctic Code Vault", "Public Sponsor",
        "Mars 2020", "YOLO", "Heart On Your Sleeve",
        "Open Sourcerer",
      ];

      const achievements = [];
      const foundNames = new Set();

      const imgRegex = /<img\s+[^>]*>/gi;
      let imgMatch;

      while ((imgMatch = imgRegex.exec(html)) !== null) {
        const imgTag = imgMatch[0];
        const altMatch = /alt="([^"]*)"/i.exec(imgTag);
        const srcMatch = /src="([^"]*)"/i.exec(imgTag);

        if (altMatch && srcMatch) {
          const altText = altMatch[1];
          const srcText = srcMatch[1];

          for (const name of knownAchievements) {
            if (altText.toLowerCase().includes(name.toLowerCase()) && !foundNames.has(name)) {
              foundNames.add(name);
              achievements.push({
                title: name,
                imageUrl: srcText.startsWith("http") ? srcText : `https://github.com${srcText}`,
                earned: true,
              });
              break;
            }
          }
        }
      }

      return achievements;
    } catch (error) {
      logger.error("Apify achievements scrape error:", error.message);
      return [];
    }
  },

  async fetchGitHubContributions(username) {
    try {
      const url = `https://github.com/users/${username}/contributions`;
      const response = await fetch(url, {
        headers: {
          Accept: "text/html",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        logger.warn(`Contributions page returned ${response.status}`);
        return null;
      }

      const html = await response.text();

      const combRegex = /<td[^>]*data-date="([^"]+)"[^>]*data-level="(\d+)"[^>]*>(?:\s*<\/td>\s*<tool-tip[^>]*>(\d+)\s*contributions?\s*on[^<]+<\/tool-tip>|\s*<\/td>)/gs;
      const days = [];
      let match;
      while ((match = combRegex.exec(html)) !== null) {
        days.push({
          date: match[1],
          level: parseInt(match[2], 10),
          count: match[3] ? parseInt(match[3], 10) : 0,
        });
      }

      if (days.length === 0) return null;

      days.sort((a, b) => a.date.localeCompare(b.date));

      const weeks = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push({ days: days.slice(i, i + 7) });
      }

      const totalContributions = days.reduce((sum, d) => sum + d.count, 0);
      const activeDays = days.filter((d) => d.count > 0).length;

      let longestStreak = 0;
      let currentStreak = 0;
      for (const d of days) {
        if (d.count > 0) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      return { weeks, totalContributions, activeDays, longestStreak };
    } catch (error) {
      logger.error("Apify contributions scrape error:", error.message);
      return null;
    }
  },
};
