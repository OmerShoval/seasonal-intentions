"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Goal } from "@/types";

const GOAL_ICONS = ["🌊", "🏄", "❤️", "🧘", "🎯", "💪", "🌱", "✨", "🎬", "🤝", "📱", "🥗", "🏋️", "🌍", "🔥"];
const CATEGORIES = ["Coaching", "Personal", "Health", "Creative", "Connection", "Work", "Surf", "Growth"];

const SEASON_ICONS = ["🌊", "🏄", "🌅", "🌴", "🔥", "🌿", "⚡", "🌙", "☀️", "🌺", "🎯", "✨"];
const SEASON_COLORS = [
  { hex: "#F59E0B", name: "Amber" },
  { hex: "#F97316", name: "Coral" },
  { hex: "#EF4444", name: "Fire" },
  { hex: "#EC4899", name: "Rose" },
  { hex: "#8B5CF6", name: "Violet" },
  { hex: "#3B82F6", name: "Ocean" },
  { hex: "#14B8A6", name: "Teal" },
  { hex: "#22C55E", name: "Forest" },
];

function newGoal(): Goal {
  return {
    id: crypto.randomUUID(),
    title: "",
    action: "",
    category: "Personal",
    icon: "✨",
    energy: 80,
    relatedIds: [],
  };
}

export default function SetupPage() {
  const router = useRouter();
  const [seasonName, setSeasonName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [seasonIcon, setSeasonIcon] = useState("🌊");
  const [seasonColor, setSeasonColor] = useState("#F59E0B");
  const [goals, setGoals] = useState<Goal[]>([newGoal()]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"season" | "goals">("season");

  const updateGoal = (id: string, patch: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleSave = async () => {
    if (!seasonName.trim() || goals.some((g) => !g.title.trim())) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("seasons")
      .insert({ name: seasonName.trim(), start_date: startDate, goals, color: seasonColor, icon: seasonIcon })
      .select()
      .single();
    if (error) { console.error(error); setSaving(false); return; }
    localStorage.setItem("active_season_id", data.id);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 border-b border-white/10">
        <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-1">New Season</p>
        <h1 className="text-2xl font-light tracking-wide">
          {step === "season" ? "Name your season" : "Your intentions"}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {step === "season" ? (
          <div className="space-y-8 max-w-sm">
            {/* Season icon */}
            <div className="space-y-3">
              <Label className="text-white/50 text-xs tracking-widest uppercase">Season icon</Label>
              <div className="flex flex-wrap gap-2">
                {SEASON_ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setSeasonIcon(ic)}
                    className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${
                      seasonIcon === ic ? "ring-2 scale-110" : "hover:bg-white/10"
                    }`}
                    style={seasonIcon === ic ? {
                      background: `${seasonColor}20`,
                      boxShadow: `0 0 0 2px ${seasonColor}60`,
                    } : {}}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Season color */}
            <div className="space-y-3">
              <Label className="text-white/50 text-xs tracking-widest uppercase">Season color</Label>
              <div className="flex gap-3 flex-wrap">
                {SEASON_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setSeasonColor(c.hex)}
                    className="w-8 h-8 rounded-full transition-all hover:scale-110"
                    style={{
                      background: c.hex,
                      boxShadow: seasonColor === c.hex
                        ? `0 0 0 2px rgba(0,0,0,1), 0 0 0 4px ${c.hex}, 0 0 12px ${c.hex}80`
                        : "none",
                      transform: seasonColor === c.hex ? "scale(1.2)" : undefined,
                    }}
                    aria-label={c.name}
                  />
                ))}
              </div>
              {/* Color preview on icon */}
              <div className="flex items-center gap-3 pt-1">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: `radial-gradient(circle, ${seasonColor}40 0%, ${seasonColor}10 100%)`,
                    boxShadow: `0 0 20px ${seasonColor}50`,
                    border: `1px solid ${seasonColor}40`,
                  }}
                >
                  {seasonIcon}
                </div>
                <p className="text-white/30 text-xs">This is how your season button will look</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/50 text-xs tracking-widest uppercase">Season name</Label>
              <Input
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
                placeholder="e.g. Angola Summer 2026"
                className="bg-transparent border-white/20 text-white placeholder:text-white/20 focus-visible:ring-white/30 text-base h-12"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/50 text-xs tracking-widest uppercase">Starts</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-white/20 text-white focus-visible:ring-white/30 h-12 [color-scheme:dark]"
              />
            </div>

            <Button
              onClick={() => setStep("goals")}
              disabled={!seasonName.trim()}
              className="w-full h-12 rounded-sm font-medium tracking-wide mt-4 border-0"
              style={{ background: seasonColor, color: "#000" }}
            >
              Continue <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6 max-w-sm pb-24">
            <p className="text-white/40 text-sm leading-relaxed">
              What do you want to bring into life this season? Each goal becomes an orbiting node in your daily practice.
            </p>

            {goals.map((goal, i) => (
              <div key={goal.id} className="border border-white/10 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs tracking-widest">INTENTION {i + 1}</span>
                  {goals.length > 1 && (
                    <button onClick={() => removeGoal(goal.id)} className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Icon picker */}
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => updateGoal(goal.id, { icon: ic })}
                      className={`w-8 h-8 rounded-full text-base flex items-center justify-center transition-all ${
                        goal.icon === ic ? "bg-white/20 ring-1 ring-white/40 scale-110" : "hover:bg-white/10"
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>

                <Input
                  value={goal.title}
                  onChange={(e) => updateGoal(goal.id, { title: e.target.value })}
                  placeholder="What's your intention?"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/20 focus-visible:ring-white/30"
                />

                <Textarea
                  value={goal.action}
                  onChange={(e) => updateGoal(goal.id, { action: e.target.value })}
                  placeholder="How will you bring it to life? What does it feel like?"
                  className="bg-transparent border-white/20 text-white placeholder:text-white/20 focus-visible:ring-white/30 min-h-[72px] resize-none"
                />

                {/* Category */}
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateGoal(goal.id, { category: cat })}
                      className={`px-2.5 py-0.5 text-[10px] rounded-full border transition-all tracking-wide ${
                        goal.category === cat
                          ? "border-white/50 bg-white/15 text-white"
                          : "border-white/15 text-white/30 hover:border-white/30"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Energy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/30 tracking-widest uppercase">
                    <span>Energy</span><span>{goal.energy}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={goal.energy}
                    onChange={(e) => updateGoal(goal.id, { energy: Number(e.target.value) })}
                    className="w-full accent-white h-1"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={() => setGoals((prev) => [...prev, newGoal()])}
              className="w-full border border-dashed border-white/20 rounded-lg py-3 text-white/30 text-sm flex items-center justify-center gap-2 hover:border-white/40 hover:text-white/50 transition-all"
            >
              <Plus size={14} /> Add another intention
            </button>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      {step === "goals" && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-6 bg-gradient-to-t from-black via-black/95 to-transparent">
          <Button
            onClick={handleSave}
            disabled={saving || !goals.every((g) => g.title.trim())}
            className="w-full h-12 rounded-sm font-medium tracking-wide border-0"
            style={{ background: seasonColor, color: "#000", opacity: saving || !goals.every((g) => g.title.trim()) ? 0.4 : 1 }}
          >
            {saving ? "Creating your season…" : "Begin the season"}
          </Button>
        </div>
      )}
    </div>
  );
}
