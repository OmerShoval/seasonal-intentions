"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GlassEffect, GlassFilter } from "@/components/ui/glass-effect";
import type { Season } from "@/types";

interface SeasonLibraryProps {
  open: boolean;
  currentSeasonId: string;
  onClose: () => void;
  onSwitch: (season: Season) => void;
}

export default function SeasonLibrary({
  open,
  currentSeasonId,
  onClose,
  onSwitch,
}: SeasonLibraryProps) {
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("seasons")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSeasons((data as Season[]) ?? []);
        setLoading(false);
      });
  }, [open]);

  const handleSelect = (season: Season) => {
    localStorage.setItem("active_season_id", season.id);
    onSwitch(season);
    onClose();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <>
      <GlassFilter />

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 transition-all duration-500 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.4)" }}
      >
        <div
          className="rounded-t-3xl border border-white/10 overflow-hidden"
          style={{
            background: "rgba(8,8,8,0.92)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-3 pb-5">
            <div>
              <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase">Your seasons</p>
              <h2 className="text-lg font-light text-white mt-0.5">Season Library</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Seasons */}
          <div className="px-4 pb-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 rounded-full border border-white/20 animate-pulse" />
              </div>
            ) : seasons.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">No seasons yet</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {seasons.map((s) => {
                  const isActive = s.id === currentSeasonId;
                  return (
                    <GlassEffect
                      key={s.id}
                      className="rounded-2xl flex-shrink-0"
                      style={{
                        border: isActive
                          ? `1px solid ${s.color}80`
                          : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: isActive
                          ? `0 0 24px ${s.color}40, 0 6px 6px rgba(0,0,0,0.3)`
                          : "0 6px 6px rgba(0,0,0,0.3)",
                      }}
                      onClick={() => handleSelect(s)}
                    >
                      <div className="flex flex-col items-center px-5 py-4 gap-2 w-[100px]">
                        {/* Season icon */}
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                          style={{
                            background: `radial-gradient(circle, ${s.color}30 0%, ${s.color}08 100%)`,
                            boxShadow: isActive ? `0 0 16px ${s.color}60` : "none",
                          }}
                        >
                          {s.icon}
                        </div>
                        {/* Name */}
                        <p className="text-white text-[11px] font-medium text-center leading-tight line-clamp-2">
                          {s.name}
                        </p>
                        {/* Date */}
                        <p className="text-white/30 text-[9px] text-center">
                          {formatDate(s.start_date)}
                        </p>
                        {/* Goals count */}
                        <div
                          className="px-2 py-0.5 rounded-full text-[9px] tracking-wider"
                          style={{
                            background: `${s.color}20`,
                            color: s.color,
                            border: `1px solid ${s.color}30`,
                          }}
                        >
                          {s.goals?.length ?? 0} intentions
                        </div>
                        {/* Active dot */}
                        {isActive && (
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: s.color }}
                          />
                        )}
                      </div>
                    </GlassEffect>
                  );
                })}
              </div>
            )}
          </div>

          {/* New season button */}
          <div className="px-4 pb-8 pt-2 border-t border-white/5">
            <button
              onClick={() => { onClose(); router.push("/setup"); }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-white/15 text-white/40 text-sm hover:border-white/30 hover:text-white/60 transition-all"
            >
              <Plus size={14} />
              New season
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
