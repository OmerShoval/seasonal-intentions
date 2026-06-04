"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sun } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Season, Goal } from "@/types";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function MorningInner() {
  const router = useRouter();
  const params = useSearchParams();
  const preselectedGoalId = params.get("goal");

  const [season, setSeason] = useState<Season | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [intention, setIntention] = useState("");
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<"select" | "write" | "breathe">("select");

  const load = useCallback(async () => {
    const seasonId = localStorage.getItem("active_season_id");
    if (!seasonId) { router.push("/setup"); return; }
    const { data } = await supabase.from("seasons").select("*").eq("id", seasonId).single();
    if (!data) { router.push("/setup"); return; }
    setSeason(data as Season);
    if (preselectedGoalId) {
      const goal = (data as Season).goals.find((g) => g.id === preselectedGoalId);
      if (goal) { setSelectedGoal(goal); setPhase("write"); }
    }
  }, [router, preselectedGoalId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!season || !selectedGoal || !intention.trim()) return;
    setSaving(true);
    await supabase.from("daily_entries").upsert(
      {
        season_id: season.id,
        entry_date: todayISO(),
        morning_focus_goal_id: selectedGoal.id,
        morning_intention: intention.trim(),
        morning_completed_at: new Date().toISOString(),
      },
      { onConflict: "season_id,entry_date" }
    );
    setPhase("breathe");
    setSaving(false);
  };

  if (!season) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border border-white/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 border-b border-white/10">
        <button onClick={() => router.push("/")} className="text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-white/30 text-xs tracking-[0.3em] uppercase flex items-center gap-2">
            <Sun size={12} className="text-amber-400" /> Morning ritual
          </p>
          <p className="text-white/50 text-sm mt-0.5">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto">
        {phase === "select" && (
          <div className="space-y-6 max-w-sm">
            <h2 className="text-2xl font-light leading-snug">
              Which intention calls to you today?
            </h2>
            <div className="space-y-3">
              {season.goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => { setSelectedGoal(goal); setPhase("write"); }}
                  className="w-full text-left p-4 rounded-lg border border-white/10 hover:border-white/30 bg-white/2 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{goal.icon}</span>
                    <div>
                      <p className="text-white/90 text-sm font-medium group-hover:text-white transition-colors">{goal.title}</p>
                      <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{goal.action}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "write" && selectedGoal && (
          <div className="space-y-8 max-w-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedGoal.icon}</span>
                <div>
                  <p className="text-white/40 text-xs tracking-widest uppercase">Today&apos;s focus</p>
                  <h2 className="text-xl font-light mt-0.5">{selectedGoal.title}</h2>
                </div>
              </div>
              <p className="text-white/30 text-sm leading-relaxed pl-12">{selectedGoal.action}</p>
            </div>

            <div className="space-y-3">
              <p className="text-white/50 text-sm leading-relaxed">
                Feel into this intention. What does it mean for today specifically? Write from the heart.
              </p>
              <Textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="Today I intend to…"
                className="bg-transparent border-white/20 text-white placeholder:text-white/20 focus-visible:ring-white/30 min-h-[160px] resize-none text-base leading-relaxed"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => { setSelectedGoal(null); setPhase("select"); }}
                className="text-white/30 hover:text-white/60 hover:bg-transparent px-0"
              >
                ← Change
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !intention.trim()}
                className="flex-1 h-12 bg-white text-black hover:bg-white/90 rounded-sm font-medium tracking-wide"
              >
                {saving ? "Setting intention…" : "Set my intention"}
              </Button>
            </div>
          </div>
        )}

        {phase === "breathe" && selectedGoal && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
            <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center animate-pulse">
              <span className="text-4xl">{selectedGoal.icon}</span>
            </div>
            <div className="space-y-3 max-w-xs">
              <p className="text-white/40 text-xs tracking-[0.3em] uppercase">Intention set</p>
              <h2 className="text-2xl font-light leading-snug">{selectedGoal.title}</h2>
              <p className="text-white/50 text-sm italic leading-relaxed">&ldquo;{intention}&rdquo;</p>
            </div>
            <p className="text-white/20 text-xs tracking-widest">Take a breath. Carry this with you.</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-transparent border border-white/20 text-white/60 hover:bg-white/5 hover:text-white rounded-sm px-8"
            >
              Back to season
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MorningPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <MorningInner />
    </Suspense>
  );
}
