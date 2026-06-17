/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TileState, Direction } from "../types";
import { getAbsolutePorts } from "../utils/gridUtils";
import { Zap, ShieldAlert, Key, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WaveguideGridProps {
  board: TileState[][];
  energizedIds: Set<string>;
  onRotate: (x: number, y: number) => void;
  hoveredEntanglement: string | null;
  setHoveredEntanglement: (id: string | null) => void;
}

export const WaveguideGrid: React.FC<WaveguideGridProps> = ({
  board,
  energizedIds,
  onRotate,
  hoveredEntanglement,
  setHoveredEntanglement,
}) => {
  const height = board.length;
  const width = board[0]?.length || 0;

  // Map entanglement ID to color theme
  const getEntanglementTheme = (id: string | null) => {
    if (!id) return null;
    const key = id.toLowerCase();
    if (key.includes("alpha") || key.includes("1")) {
      return {
        bg: "bg-purple-950/40",
        border: "border-purple-500",
        glow: "shadow-[0_0_15px_rgba(168,85,247,0.5)]",
        line: "stroke-purple-400",
        text: "text-purple-300",
        symbol: "α",
      };
    }
    if (key.includes("beta") || key.includes("2")) {
      return {
        bg: "bg-pink-950/40",
        border: "border-pink-500",
        glow: "shadow-[0_0_15px_rgba(236,72,153,0.5)]",
        line: "stroke-pink-400",
        text: "text-pink-300",
        symbol: "β",
      };
    }
    if (key.includes("ghz") || key.includes("gamma")) {
      return {
        bg: "bg-emerald-950/40",
        border: "border-emerald-500",
        glow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
        line: "stroke-emerald-400",
        text: "text-emerald-300",
        symbol: "Ψ",
      };
    }
    return {
      bg: "bg-amber-950/40",
      border: "border-amber-500",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
      line: "stroke-amber-400",
      text: "text-amber-300",
      symbol: "ω",
    };
  };

  // Convert absolute port direction to pixel coordinate in 100x100 SVG space
  const getPortEndpoints = (direction: Direction) => {
    switch (direction) {
      case "up":
        return { x: 50, y: 0 };
      case "right":
        return { x: 100, y: 50 };
      case "down":
        return { x: 50, y: 100 };
      case "left":
        return { x: 0, y: 50 };
    }
  };

  return (
    <div
      className="grid gap-2 p-4 bg-slate-950/60 rounded-3xl border border-slate-800/80 backdrop-blur-xl max-w-full mx-auto shadow-2xl relative"
      style={{
        gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, y) =>
        row.map((tile, x) => {
          if (tile.type === "empty") {
            return (
              <div
                key={tile.id}
                className="aspect-square bg-slate-950/20 border border-slate-900/40 rounded-xl flex items-center justify-center relative opacity-20"
              >
                <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
              </div>
            );
          }

          const isEnergized = energizedIds.has(tile.id);
          const absolutePorts = getAbsolutePorts(tile.initialPorts, tile.rotation);
          const theme = getEntanglementTheme(tile.entanglementId);
          const isFocussedLink = hoveredEntanglement && tile.entanglementId === hoveredEntanglement;

          return (
            <motion.div
              key={tile.id}
              whileHover={tile.locked ? {} : { scale: 1.03 }}
              whileTap={tile.locked ? {} : { scale: 0.97 }}
              onClick={() => onRotate(x, y)}
              onMouseEnter={() => tile.entanglementId && setHoveredEntanglement(tile.entanglementId)}
              onMouseLeave={() => setHoveredEntanglement(null)}
              className={`
                aspect-square rounded-2xl relative overflow-hidden transition-all duration-300 select-none flex items-center justify-center cursor-pointer 
                ${tile.type === "obstacle" ? "bg-slate-900/60 border-slate-800" : ""}
                ${tile.type === "source" ? "bg-cyan-950/30 border-cyan-500/50 cursor-default" : ""}
                ${tile.type === "core" ? "bg-amber-950/30 border-amber-500/50 cursor-default" : ""}
                ${tile.type === "normal" ? "bg-slate-900 border-slate-800 hover:border-slate-500" : ""}
                ${theme ? `${theme.bg} ${theme.border} border-2` : "border"}
                ${isEnergized ? "border-cyan-400Shadow" : ""}
                ${isFocussedLink ? `${theme?.glow} scale-[1.02] border-opacity-100 z-10` : ""}
              `}
              id={tile.id}
            >
              {/* Entanglement Overlay Ring & Icons */}
              {theme && (
                <div className="absolute top-1 right-1 flex items-center gap-0.5 pointer-events-none">
                  {tile.entanglementType === "inverse" && (
                    <span className="text-[9px] font-mono font-bold text-rose-500 px-0.5 rounded bg-slate-950/80">
                      ±
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono font-bold tracking-tight bg-slate-950/80 px-1 rounded-md border border-slate-800 ${theme.text}`}
                  >
                    {theme.symbol}
                  </span>
                </div>
              )}

              {/* Grid content based on type */}
              {tile.type === "obstacle" ? (
                <div className="flex flex-col items-center justify-center p-2 text-center text-slate-500 pointer-events-none">
                  <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse mb-1" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600">
                    Locked
                  </span>
                </div>
              ) : (
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full p-2 pointer-events-none"
                  style={{ transform: "rotate(0deg)" }} // Rotations are precomputed into absolutePorts
                >
                  {/* Central Node Core background highlight */}
                  <circle
                    cx="50"
                    cy="50"
                    r="15"
                    className={`
                      transition-all duration-300
                      ${tile.type === "source" ? "fill-cyan-500/20 stroke-cyan-400 stroke-2" : ""}
                      ${tile.type === "core" ? "fill-amber-500/20 stroke-amber-400 stroke-2" : ""}
                      ${tile.type === "normal" && isEnergized ? "fill-cyan-500/20 stroke-cyan-400 stroke-[1.5]" : ""}
                      ${tile.type === "normal" && !isEnergized ? "fill-slate-800 stroke-slate-700 stroke-[1.5]" : ""}
                    `}
                  />

                  {/* Waveguide Lines rendering directions */}
                  {absolutePorts.map((dir) => {
                    const { x: px, y: py } = getPortEndpoints(dir);
                    return (
                      <g key={dir}>
                        {/* Background structural conduit line */}
                        <line
                          x1="50"
                          y1="50"
                          x2={px}
                          y2={py}
                          stroke="#334155"
                          strokeWidth="8"
                          strokeLinecap="round"
                          className="transition-all duration-300"
                        />
                        {/* Energetic coherence flowing line overlay */}
                        {isEnergized && (
                          <line
                            x1="50"
                            y1="50"
                            x2={px}
                            y2={py}
                            stroke="#06b6d4"
                            strokeWidth="4"
                            strokeLinecap="round"
                            className="stroke-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.8)] animate-pulse"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Specific aesthetics depending on types */}
                  {tile.type === "source" && (
                    <g transform="translate(42, 42)">
                      <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                    </g>
                  )}

                  {tile.type === "core" && (
                    <g transform="translate(42, 42)">
                      <Key className={`w-4 h-4 ${isEnergized ? "text-green-400 animate-bounce" : "text-amber-400 animate-pulse"}`} />
                    </g>
                  )}
                </svg>
              )}

              {/* Status Indicator Bar at bottom of tile if energized */}
              {isEnergized && tile.type !== "obstacle" && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)] pointer-events-none" />
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
};
