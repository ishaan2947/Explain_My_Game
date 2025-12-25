"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getTeam, getGames, createGame, deleteTeam } from "@/lib/api";
import type { TeamWithMembers, Game } from "@/types/api";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGameForm, setShowGameForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [gameForm, setGameForm] = useState({
    opponent_name: "",
    game_date: new Date().toISOString().split("T")[0],
    location: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, [teamId]);

  async function loadData() {
    try {
      const [teamData, gamesData] = await Promise.all([
        getTeam(teamId),
        getGames(teamId),
      ]);
      setTeam(teamData);
      setGames(gamesData);
    } catch (e: any) {
      setError(e.message || "Failed to load team");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGame(e: React.FormEvent) {
    e.preventDefault();
    if (!gameForm.opponent_name.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const game = await createGame(teamId, {
        opponent_name: gameForm.opponent_name.trim(),
        game_date: gameForm.game_date,
        location: gameForm.location.trim() || undefined,
        notes: gameForm.notes.trim() || undefined,
      });
      setGames([game, ...games]);
      setGameForm({ opponent_name: "", game_date: new Date().toISOString().split("T")[0], location: "", notes: "" });
      setShowGameForm(false);
      // Navigate to the game to add stats
      router.push(`/dashboard/games/${game.id}`);
    } catch (e: any) {
      setError(e.message || "Failed to create game");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTeam() {
    if (!confirm("Are you sure you want to delete this team? All games and reports will be deleted.")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteTeam(teamId);
      router.push("/dashboard/teams");
    } catch (e: any) {
      setError(e.message || "Failed to delete team");
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!team) return <div className="p-8 text-center text-muted-foreground">Team not found</div>;

  const userRole = team.members[0]?.role || "member";
  const isOwner = userRole === "owner";
  const isCoachOrOwner = userRole === "owner" || userRole === "coach";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/teams" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Teams
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="mt-1 text-muted-foreground capitalize">{team.sport}</p>
          </div>
          <div className="flex gap-2">
            {isCoachOrOwner && (
              <button
                onClick={() => setShowGameForm(!showGameForm)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Game
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDeleteTeam}
                disabled={deleting}
                className="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Team"}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Create Game Form */}
      {showGameForm && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Add New Game</h2>
          <form onSubmit={handleCreateGame} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Opponent *</label>
                <input
                  type="text"
                  value={gameForm.opponent_name}
                  onChange={(e) => setGameForm({ ...gameForm, opponent_name: e.target.value })}
                  placeholder="Opponent team name"
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Date *</label>
                <input
                  type="date"
                  value={gameForm.game_date}
                  onChange={(e) => setGameForm({ ...gameForm, game_date: e.target.value })}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={gameForm.location}
                  onChange={(e) => setGameForm({ ...gameForm, location: e.target.value })}
                  placeholder="Game location"
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Notes</label>
                <input
                  type="text"
                  value={gameForm.notes}
                  onChange={(e) => setGameForm({ ...gameForm, notes: e.target.value })}
                  placeholder="Pre-game notes"
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Game"}
              </button>
              <button
                type="button"
                onClick={() => setShowGameForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Games List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold">Games</h2>
        </div>
        <div className="p-4">
          {games.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No games recorded yet.</p>
              {isCoachOrOwner && (
                <button
                  onClick={() => setShowGameForm(true)}
                  className="mt-2 text-primary hover:underline"
                >
                  Add your first game
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <Link
                  key={game.id}
                  href={`/dashboard/games/${game.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary"
                >
                  <div>
                    <p className="font-medium">vs {game.opponent_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(game.game_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {game.location && ` • ${game.location}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {game.has_report ? (
                      <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                        Report Ready
                      </span>
                    ) : game.has_stats ? (
                      <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                        Stats Added
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        Needs Stats
                      </span>
                    )}
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Members */}
      <div className="mt-8 rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold">Team Members</h2>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {team.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{member.user_email || "Unknown"}</p>
                  <p className="text-sm capitalize text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
