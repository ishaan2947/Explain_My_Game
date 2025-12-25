"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getGame, getStats, createStats, getGameReport, generateReport } from "@/lib/api";
import type { Game, BasketballStats, Report } from "@/types/api";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[confidence]}`}>
      {confidence}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-blue-500/20 text-blue-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[priority]}`}>
      {priority}
    </span>
  );
}

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<(Game & { basketball_stats?: { id: string; points_for: number; points_against: number } }) | null>(null);
  const [stats, setStats] = useState<BasketballStats | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatsForm, setShowStatsForm] = useState(false);
  const [savingStats, setSavingStats] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const [statsForm, setStatsForm] = useState({
    points_for: 0,
    points_against: 0,
    fg_made: 0,
    fg_att: 0,
    three_made: 0,
    three_att: 0,
    ft_made: 0,
    ft_att: 0,
    rebounds_off: 0,
    rebounds_def: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
  });

  useEffect(() => {
    loadData();
  }, [gameId]);

  async function loadData() {
    try {
      const gameData = await getGame(gameId);
      setGame(gameData);

      // Try to load stats
      if (gameData.basketball_stats) {
        try {
          const statsData = await getStats(gameId);
          setStats(statsData);
        } catch (e) {
          // No stats yet
        }
      }

      // Try to load report
      try {
        const reportData = await getGameReport(gameId);
        setReport(reportData);
      } catch (e) {
        // No report yet
      }
    } catch (e: any) {
      setError(e.message || "Failed to load game");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveStats(e: React.FormEvent) {
    e.preventDefault();
    setSavingStats(true);
    setError(null);

    try {
      const newStats = await createStats(gameId, statsForm);
      setStats(newStats);
      setShowStatsForm(false);
    } catch (e: any) {
      setError(e.message || "Failed to save stats");
    } finally {
      setSavingStats(false);
    }
  }

  async function handleGenerateReport() {
    setGeneratingReport(true);
    setError(null);

    try {
      const response = await generateReport(gameId);
      setReport(response.report);
    } catch (e: any) {
      setError(e.message || "Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!game) return <div className="p-8 text-center text-muted-foreground">Game not found</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/dashboard/teams/${game.team_id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Team
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">vs {game.opponent_name}</h1>
            <p className="mt-1 text-muted-foreground">
              {new Date(game.game_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {game.location && ` • ${game.location}`}
            </p>
          </div>
        </div>
        {game.notes && (
          <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-4">
            <p className="text-sm text-muted-foreground">{game.notes}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Stats Section */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">Game Stats</h2>
            {!stats && !showStatsForm && (
              <button
                onClick={() => setShowStatsForm(true)}
                className="text-sm text-primary hover:underline"
              >
                Add Stats
              </button>
            )}
          </div>
          <div className="p-4">
            {showStatsForm ? (
              <form onSubmit={handleSaveStats} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Points For *</label>
                    <input
                      type="number"
                      min="0"
                      value={statsForm.points_for}
                      onChange={(e) => setStatsForm({ ...statsForm, points_for: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Points Against *</label>
                    <input
                      type="number"
                      min="0"
                      value={statsForm.points_against}
                      onChange={(e) => setStatsForm({ ...statsForm, points_against: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <p className="text-sm font-medium text-muted-foreground">Shooting</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">FG Made</label>
                    <input type="number" min="0" value={statsForm.fg_made} onChange={(e) => setStatsForm({ ...statsForm, fg_made: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">FG Attempted</label>
                    <input type="number" min="0" value={statsForm.fg_att} onChange={(e) => setStatsForm({ ...statsForm, fg_att: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">3PT Made</label>
                    <input type="number" min="0" value={statsForm.three_made} onChange={(e) => setStatsForm({ ...statsForm, three_made: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">3PT Attempted</label>
                    <input type="number" min="0" value={statsForm.three_att} onChange={(e) => setStatsForm({ ...statsForm, three_att: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">FT Made</label>
                    <input type="number" min="0" value={statsForm.ft_made} onChange={(e) => setStatsForm({ ...statsForm, ft_made: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">FT Attempted</label>
                    <input type="number" min="0" value={statsForm.ft_att} onChange={(e) => setStatsForm({ ...statsForm, ft_att: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>

                <p className="text-sm font-medium text-muted-foreground">Other Stats</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Off Reb</label>
                    <input type="number" min="0" value={statsForm.rebounds_off} onChange={(e) => setStatsForm({ ...statsForm, rebounds_off: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Def Reb</label>
                    <input type="number" min="0" value={statsForm.rebounds_def} onChange={(e) => setStatsForm({ ...statsForm, rebounds_def: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Assists</label>
                    <input type="number" min="0" value={statsForm.assists} onChange={(e) => setStatsForm({ ...statsForm, assists: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Steals</label>
                    <input type="number" min="0" value={statsForm.steals} onChange={(e) => setStatsForm({ ...statsForm, steals: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Blocks</label>
                    <input type="number" min="0" value={statsForm.blocks} onChange={(e) => setStatsForm({ ...statsForm, blocks: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Turnovers</label>
                    <input type="number" min="0" value={statsForm.turnovers} onChange={(e) => setStatsForm({ ...statsForm, turnovers: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Fouls</label>
                    <input type="number" min="0" value={statsForm.fouls} onChange={(e) => setStatsForm({ ...statsForm, fouls: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={savingStats} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                    {savingStats ? "Saving..." : "Save Stats"}
                  </button>
                  <button type="button" onClick={() => setShowStatsForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            ) : stats ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    <span className={stats.points_for > stats.points_against ? "text-green-400" : stats.points_for < stats.points_against ? "text-red-400" : ""}>
                      {stats.points_for}
                    </span>
                    <span className="mx-2 text-muted-foreground">-</span>
                    <span>{stats.points_against}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stats.points_for > stats.points_against ? "Win" : stats.points_for < stats.points_against ? "Loss" : "Tie"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{stats.fg_percentage?.toFixed(1) || "-"}%</p>
                    <p className="text-xs text-muted-foreground">FG ({stats.fg_made}/{stats.fg_att})</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats.three_percentage?.toFixed(1) || "-"}%</p>
                    <p className="text-xs text-muted-foreground">3PT ({stats.three_made}/{stats.three_att})</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats.ft_percentage?.toFixed(1) || "-"}%</p>
                    <p className="text-xs text-muted-foreground">FT ({stats.ft_made}/{stats.ft_att})</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats.total_rebounds || 0}</p>
                    <p className="text-xs text-muted-foreground">Rebounds</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats.assists}</p>
                    <p className="text-xs text-muted-foreground">Assists</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats.turnovers}</p>
                    <p className="text-xs text-muted-foreground">Turnovers</p>
                  </div>
                </div>

                {!report && (
                  <button onClick={handleGenerateReport} disabled={generatingReport} className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                    {generatingReport ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating Report...
                      </span>
                    ) : (
                      "Generate AI Report"
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No stats recorded yet.</p>
                <button onClick={() => setShowStatsForm(true)} className="mt-2 text-primary hover:underline">
                  Add game stats
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Report Section */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="text-lg font-semibold">AI Report</h2>
          </div>
          <div className="p-4">
            {report ? (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Summary</h3>
                  <p className="text-sm leading-relaxed">{report.summary}</p>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">Key Insights</h3>
                  <div className="space-y-3">
                    {report.key_insights.map((insight, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-medium">{insight.title}</span>
                          <ConfidenceBadge confidence={insight.confidence} />
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">{insight.description}</p>
                        <p className="text-xs italic text-muted-foreground">📊 {insight.evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">Action Items</h3>
                  <div className="space-y-3">
                    {report.action_items.map((item, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          <PriorityBadge priority={item.priority} />
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground">📏 Metric: {item.metric}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">Practice Focus</h3>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="text-sm">{report.practice_focus}</p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">Questions for Next Game</h3>
                  <div className="space-y-2">
                    {report.questions_for_next_game.map((q, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <p className="font-medium">❓ {q.question}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{q.context}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Generated by {report.model_used} • {report.generation_time_ms}ms
                    {report.risk_flags.length > 0 && (
                      <span className="ml-2 text-yellow-400">⚠ {report.risk_flags.join(", ")}</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                {stats ? (
                  <>
                    <p className="text-muted-foreground">No report generated yet.</p>
                    <button onClick={handleGenerateReport} disabled={generatingReport} className="mt-2 text-primary hover:underline">
                      {generatingReport ? "Generating..." : "Generate AI Report"}
                    </button>
                  </>
                ) : (
                  <p className="text-muted-foreground">Add game stats to generate a report.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
