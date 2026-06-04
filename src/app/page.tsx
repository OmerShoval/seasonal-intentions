"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { GlassFilter } from "@/components/ui/glass-effect";
import SeasonLibrary from "@/components/season-library";
import type { Season, DailyEntry, Goal } from "@/types";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function Home() {
  const router = useRouter();
  const [season, setSeason] = useState<Season | null>(null);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const load = useCallback(async () => {
    const seasonId = localStorage.getItem("active_season_id");
    if (!seasonId) { router.push("/setup"); return; }

    const [{ data: s }, { data: e }] = await Promise.all([
      supabase.from("seasons").select("*").eq("id", seasonId).single(),
      supabase.from("daily_entries").select("*").eq("season_id", seasonId).eq("entry_date", todayISO()).maybeSingle(),
    ]);

    if (!s) { router.push("/setup"); return; }
    setSeason(s as Season);
    setEntry(e as DailyEntry | null);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleSelectGoal = (goal: Goal) => {
    router.push(`/morning?goal=${goal.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border border-white/20 animate-pulse" />
      </div>
    );
  }

  const morningDone = !!entry?.morning_completed_at;
  const eveningDone = !!entry?.evening_completed_at;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const seasonColor = season?.color ?? "#F59E0B";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <GlassFilter />

      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-start justify-between">
        <div>
          <p className="text-white/30 text-xs tracking-[0.3em] uppercase">{greeting}</p>
          <h1 className="text-xl font-light mt-0.5 tracking-wide">{season?.name}</h1>
        </div>
        <button
          onClick={() => router.push("/setup")}
          className="text-white/20 hover:text-white/50 transition-colors mt-1"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Ritual buttons */}
      <div className="px-6 flex gap-3 mb-2">
        <button
          onClick={() => router.push("/morning")}
          className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all ${
            morningDone
              ? "border-white/20 bg-white/5 text-white/30"
              : "border-amber-400/40 bg-amber-400/5 text-amber-300 hover:bg-amber-400/10"
          }`}
        >
          <Sun size={14} />
          <span>{morningDone ? "Morning done" : "Morning ritual"}</span>
          {morningDone && <span className="ml-auto text-white/20 text-xs">✓</span>}
        </button>
        <button
          onClick={() => router.push("/evening")}
          className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all ${
            eveningDone
              ? "border-white/20 bg-white/5 text-white/30"
              : "border-purple-400/40 bg-purple-400/5 text-purple-300 hover:bg-purple-400/10"
          }`}
        >
          <Moon size={14} />
          <span>{eveningDone ? "Evening done" : "Evening ritual"}</span>
          {eveningDone && <span className="ml-auto text-white/20 text-xs">✓</span>}
        </button>
      </div>

      {/* Date + hint */}
      <div className="px-6 mb-4">
        <p className="text-white/20 text-xs tracking-widest">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
          {!morningDone && (
            <span className="ml-3 text-amber-400/50">· tap a node to set today&apos;s focus</span>
          )}
        </p>
      </div>

      {/* Orbital canvas */}
      <div className="flex-1 min-h-[500px]">
        {season?.goals && (
          <RadialOrbitalTimeline
            goals={season.goals}
            onSelectGoal={!morningDone ? handleSelectGoal : undefined}
            centerLabel="TODAY"
          />
        )}
      </div>

      {/* Floating Season Library button */}
      <button
        onClick={() => setLibraryOpen(true)}
        className="fixed bottom-8 right-6 z-30 w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: `radial-gradient(circle at 40% 35%, ${seasonColor}60, ${seasonColor}20)`,
          border: `1px solid ${seasonColor}50`,
          boxShadow: `0 0 24px ${seasonColor}50, 0 4px 16px rgba(0,0,0,0.4), inset 1px 1px 1px rgba(255,255,255,0.2)`,
          backdropFilter: "blur(12px)",
          transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
        }}
        aria-label="Season Library"
      >
        {season?.icon ?? "🌊"}
      </button>

      {/* Season Library */}
      <SeasonLibrary
        open={libraryOpen}
        currentSeasonId={season?.id ?? ""}
        onClose={() => setLibraryOpen(false)}
        onSwitch={(s) => setSeason(s)}
      />
    </div>
  );
}
