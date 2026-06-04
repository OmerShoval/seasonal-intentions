"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Season, DailyEntry } from "@/types";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

const MOODS = ["🌊", "🔥", "🌱", "😌", "⚡", "💙", "🌙", "✨"];

export default function EveningPage() {
  const router = useRouter();
  const [season, setSeason] = useState<Season | null>(null);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [journal, setJournal] = useState("");
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    const seasonId = localStorage.getItem("active_season_id");
    if (!seasonId) { router.push("/setup"); return; }
    const [{ data: s }, { data: e }] = await Promise.all([
      supabase.from("seasons").select("*").eq("id", seasonId).single(),
      supabase.from("daily_entries").select("*").eq("season_id", seasonId).eq("entry_date", todayISO()).maybeSingle(),
    ]);
    if (!s) { router.push("/setup"); return; }
    setSeason(s as Season);
    const existing = e as DailyEntry | null;
    if (existing) {
      setEntry(existing);
      if (existing.evening_journal) setJournal(existing.evening_journal);
      if (existing.evening_energy) setEnergy(existing.evening_energy);
      if (existing.evening_mood) setMood(existing.evening_mood);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!season || !journal.trim()) return;
    setSaving(true);
    const payload: Record<string, unknown> = {
      season_id: season.id,
      entry_date: todayISO(),
      evening_journal: journal.trim(),
      evening_energy: energy,
      evening_mood: mood,
      evening_completed_at: new Date().toISOString(),
    };
    if (entry?.morning_focus_goal_id) {
      payload.morning_focus_goal_id = entry.morning_focus_goal_id;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("daily_entries") as any).upsert(payload, { onConflict: "season_id,entry_date" });
    setSaving(false);
    setDone(true);
  };

  const focusGoal = season?.goals.find((g) => g.id === entry?.morning_focus_goal_id);

  if (!season) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border border-white/20 animate-pulse" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-8 space-y-8">
        <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center">
          <Moon size={28} className="text-purple-400/60" />
        </div>
        <div className="space-y-3">
          <p className="text-white/30 text-xs tracking-[0.3em] uppercase">Day complete</p>
          <h2 className="text-2xl font-light">Rest well.</h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            You showed up today. That&apos;s everything.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < energy ? "bg-purple-400/60" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <Button
          onClick={() => router.push("/")}
          className="bg-transparent border border-white/20 text-white/60 hover:bg-white/5 hover:text-white rounded-sm px-8"
        >
          Back to season
        </Button>
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
            <Moon size={12} className="text-purple-400" /> Evening reflection
          </p>
          <p className="text-white/50 text-sm mt-0.5">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto space-y-8 max-w-sm pb-32">
        {/* Today's focus recap */}
        {focusGoal && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-white/2">
            <span className="text-2xl">{focusGoal.icon}</span>
            <div>
              <p className="text-white/30 text-[10px] tracking-widest uppercase">Today you focused on</p>
              <p className="text-white/80 text-sm mt-0.5">{focusGoal.title}</p>
              {entry?.morning_intention && (
                <p className="text-white/30 text-xs mt-1 italic line-clamp-2">&ldquo;{entry.morning_intention}&rdquo;</p>
              )}
            </div>
          </div>
        )}

        {/* Journal */}
        <div className="space-y-3">
          <p className="text-white/50 text-sm leading-relaxed">
            How did the day feel? What happened? What did you notice?
          </p>
          <Textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Today I noticed…"
            className="bg-transparent border-white/20 text-white placeholder:text-white/20 focus-visible:ring-white/30 min-h-[200px] resize-none text-base leading-relaxed"
            autoFocus
          />
        </div>

        {/* Mood */}
        <div className="space-y-3">
          <p className="text-white/30 text-xs tracking-widest uppercase">How does today feel?</p>
          <div className="flex gap-3 flex-wrap">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m === mood ? "" : m)}
                className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${
                  mood === m ? "bg-white/20 ring-1 ring-white/40 scale-110" : "hover:bg-white/10"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-white/30 tracking-widest uppercase">
            <span>Energy</span><span>{energy}/10</span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setEnergy(i + 1)}
                className={`flex-1 h-8 rounded-sm transition-all ${
                  i < energy ? "bg-purple-400/60 hover:bg-purple-400/80" : "bg-white/10 hover:bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-6 bg-gradient-to-t from-black via-black/95 to-transparent">
        <Button
          onClick={handleSave}
          disabled={saving || !journal.trim()}
          className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-sm font-medium tracking-wide"
        >
          {saving ? "Saving…" : "Close the day"}
        </Button>
      </div>
    </div>
  );
}
