"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTeams, getGames } from "@/lib/api";
import type { Team, Game } from "@/types/api";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [recentGames, setRecentGames] = useState<(Game & { teamName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const teamsData = await getTeams();
        setTeams(teamsData);

        // Get recent games from all teams
        const allGames: (Game & { teamName: string })[] = [];
        for (const team of teamsData.slice(0, 3)) {
          try {
            const games = await getGames(team.id);
            allGames.push(...games.slice(0, 3).map(g => ({ ...g, teamName: team.name })));
          } catch (e) {
            // Ignore errors for individual teams
          }
        }
        // Sort by date, newest first
        allGames.sort((a, b) => new Date(b.game_date).getTime() - new Date(a.game_date).getTime());
        setRecentGames(allGames.slice(0, 5));
      } catch (e: any) {
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const gamesWithReports = recentGames.filter(g => g.has_report).length;
  const gamesWithStats = recentGames.filter(g => g.has_stats).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Welcome back! Here&apos;s an overview of your teams and games.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Teams" value={teams.length} />
        <StatCard title="Recent Games" value={recentGames.length} />
        <StatCard title="Games with Stats" value={gamesWithStats} />
        <StatCard title="Reports Generated" value={gamesWithReports} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Teams */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">Your Teams</h2>
            <Link
              href="/dashboard/teams"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="p-4">
            {teams.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No teams yet.</p>
                <Link
                  href="/dashboard/teams"
                  className="mt-2 inline-block text-primary hover:underline"
                >
                  Create your first team
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.slice(0, 5).map((team) => (
                  <Link
                    key={team.id}
                    href={`/dashboard/teams/${team.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                  >
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{team.sport}</p>
                    </div>
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Games */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">Recent Games</h2>
          </div>
          <div className="p-4">
            {recentGames.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No games recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/dashboard/games/${game.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                  >
                    <div>
                      <p className="font-medium">vs {game.opponent_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {game.teamName} • {new Date(game.game_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {game.has_report ? (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                          Report
                        </span>
                      ) : game.has_stats ? (
                        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
                          Stats
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          No data
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
