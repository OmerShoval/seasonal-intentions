"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Goal } from "@/types";

interface OrbitalNode extends Goal {
  status?: "completed" | "in-progress" | "pending";
}

interface RadialOrbitalTimelineProps {
  goals: OrbitalNode[];
  onSelectGoal?: (goal: OrbitalNode) => void;
  centerLabel?: string;
}

export default function RadialOrbitalTimeline({
  goals,
  onSelectGoal,
  centerLabel = "NOW",
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<string, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach((key) => { newState[key] = false; });
      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const goal = goals.find((g) => g.id === id);
        const newPulse: Record<string, boolean> = {};
        goal?.relatedIds?.forEach((rid) => { newPulse[rid] = true; });
        setPulseEffect(newPulse);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return newState;
    });
  };

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 180;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, zIndex, opacity };
  };

  const isRelatedToActive = (goalId: string): boolean => {
    if (!activeNodeId) return false;
    const active = goals.find((g) => g.id === activeNodeId);
    return active?.relatedIds?.includes(goalId) ?? false;
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center bg-black overflow-hidden"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-2xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{ perspective: "1000px" }}
        >
          {/* Center pulse */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/60 via-orange-400/40 to-yellow-300/20 animate-pulse flex items-center justify-center z-10">
            <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70" />
            <div className="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50" style={{ animationDelay: "0.5s" }} />
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center">
              <span className="text-black text-[7px] font-bold tracking-widest">{centerLabel}</span>
            </div>
          </div>

          {/* Orbit ring */}
          <div className="absolute w-[360px] h-[360px] rounded-full border border-white/10" />

          {/* Goal nodes */}
          {goals.map((goal, index) => {
            const pos = calculateNodePosition(index, goals.length);
            const isExpanded = expandedItems[goal.id];
            const isRelated = isRelatedToActive(goal.id);
            const isPulsing = pulseEffect[goal.id];

            return (
              <div
                key={goal.id}
                ref={(el) => { nodeRefs.current[goal.id] = el; }}
                className="absolute transition-all duration-700 cursor-pointer"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  zIndex: isExpanded ? 200 : pos.zIndex,
                  opacity: isExpanded ? 1 : pos.opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(goal.id);
                }}
              >
                {/* Energy glow */}
                <div
                  className={`absolute rounded-full ${isPulsing ? "animate-pulse" : ""}`}
                  style={{
                    background: "radial-gradient(circle, rgba(255,200,100,0.15) 0%, rgba(255,255,255,0) 70%)",
                    width: `${goal.energy * 0.4 + 36}px`,
                    height: `${goal.energy * 0.4 + 36}px`,
                    left: `-${(goal.energy * 0.4 + 36 - 40) / 2}px`,
                    top: `-${(goal.energy * 0.4 + 36 - 40) / 2}px`,
                  }}
                />

                {/* Node dot */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isExpanded
                      ? "bg-white text-black border-white shadow-lg shadow-white/30 scale-150"
                      : isRelated
                      ? "bg-white/30 text-white border-white animate-pulse"
                      : "bg-black text-white/70 border-white/30"
                  }`}
                >
                  <span className="text-xs">{goal.icon}</span>
                </div>

                {/* Label */}
                <div
                  className={`absolute top-12 whitespace-nowrap text-[10px] font-semibold tracking-wider transition-all duration-300 -translate-x-1/2 left-1/2 ${
                    isExpanded ? "text-white scale-110" : "text-white/60"
                  }`}
                >
                  {goal.title.length > 18 ? goal.title.slice(0, 18) + "…" : goal.title}
                </div>

                {/* Expanded card */}
                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-black/95 backdrop-blur-lg border-white/20 shadow-xl shadow-black/50 overflow-visible z-50">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/40" />
                    <CardHeader className="pb-2 pt-4 px-4">
                      <Badge className="w-fit px-2 text-[10px] border-white/30 bg-white/10 text-white/80">
                        {goal.category}
                      </Badge>
                      <CardTitle className="text-sm mt-2 text-white leading-snug">{goal.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-white/70 px-4 pb-4">
                      <p className="leading-relaxed">{goal.action}</p>

                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex justify-between items-center mb-1 text-white/50">
                          <span className="flex items-center gap-1"><Zap size={9} />Energy</span>
                          <span className="font-mono">{goal.energy}%</span>
                        </div>
                        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                            style={{ width: `${goal.energy}%` }}
                          />
                        </div>
                      </div>

                      {onSelectGoal && (
                        <Button
                          size="sm"
                          className="mt-4 w-full h-7 text-xs bg-white text-black hover:bg-white/90 rounded-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectGoal(goal);
                          }}
                        >
                          Focus on this today <ArrowRight size={10} className="ml-1" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
