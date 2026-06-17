/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { LevelConfig, TileState, AIMessage } from "./types";
import { levels as initialLevels } from "./data/levels";
import { WaveguideGrid } from "./components/WaveguideGrid";
import { AIPanel } from "./components/AIPanel";
import { RuleOverlay } from "./components/RuleOverlay";
import { propagateCoherence, getAbsolutePorts } from "./utils/gridUtils";
import { audio } from "./utils/audio";
import {
  Sparkles,
  HelpCircle,
  Undo2,
  RotateCcw,
  Bot,
  Zap,
  CheckCircle,
  Trophy,
  Play,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  Cpu,
  BookmarkCheck,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [levels, setLevels] = useState<LevelConfig[]>(initialLevels);
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [board, setBoard] = useState<TileState[][]>([]);
  const [energizedIds, setEnergizedIds] = useState<Set<string>>(new Set());
  const [moveCount, setMoveCount] = useState<number>(0);
  const [undoStack, setUndoStack] = useState<number[][][]>([]);
  const [completed, setCompleted] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);

  // Anti-mindless click decoherence protection states
  const [coherenceStability, setCoherenceStability] = useState<number>(100);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Hover states to highlight matched entanglement connections across the board
  const [hoveredEntanglement, setHoveredEntanglement] = useState<string | null>(null);

  // Erwin AI states
  const [aiChat, setAiChat] = useState<AIMessage[]>([]);
  const [isThinkingAI, setIsThinkingAI] = useState<boolean>(false);

  // New level difficulty selector for AI generation
  const [generationDifficulty, setGenerationDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [isSynthesizingLevel, setIsSynthesizingLevel] = useState<boolean>(false);

  // Custom user linking states
  const [linkModeActive, setLinkModeActive] = useState<boolean>(false);
  const [linkModeType, setLinkModeType] = useState<"direct" | "inverse">("direct");
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  const activeLevel = levels[currentLevelIdx] || levels[0];

  /**
   * Initializes the puzzle board matching a LevelConfig
   */
  const loadLevel = useCallback((lvl: LevelConfig) => {
    if (!lvl) return;
    const initializedTiles: TileState[][] = Array.from({ length: lvl.height }, (_, y) =>
      Array.from({ length: lvl.width }, (_, x) => {
        const tCfg = lvl.tiles.find((t) => t.x === x && t.y === y);
        if (tCfg) {
          return {
            ...tCfg,
            ports: [], // will be evaluated dynamically
            entanglementId: tCfg.entanglementId || null,
          } as TileState;
        } else {
          return {
            id: `tile-${x}-${y}`,
            x,
            y,
            type: "empty",
            initialPorts: [],
            ports: [],
            rotation: 0,
            entanglementId: null,
            locked: true,
          } as TileState;
        }
      })
    );

    const { energizedIds: initialEnergized } = propagateCoherence(initializedTiles);

    setBoard(initializedTiles);
    setEnergizedIds(initialEnergized);
    setMoveCount(0);
    setUndoStack([]);
    setCompleted(false);
    setCoherenceStability(100);
    setCollapsed(false);
    setLinkModeActive(false);
    setLinkModeType("direct");
    setSelectedTileId(null);

    // Initial greeting from Erwin explaining the level
    setAiChat([
      {
        id: `greeting-${lvl.id}-${Date.now()}`,
        sender: "erwin",
        text: `【レベル ${lvl.id}: ${lvl.name}】が装填された。
テーマ：${lvl.quantumConcept}
吾輩からの助言：${lvl.description}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  // Sync initial render
  useEffect(() => {
    if (activeLevel) {
      loadLevel(activeLevel);
    }
  }, [currentLevelIdx, loadLevel]);

  /**
   * Safe handle to check whether there is a connection containing the Core node.
   */
  const checkCompletion = (eIds: Set<string>, currentBoard: TileState[][]) => {
    let hasCoreEnergized = false;
    currentBoard.forEach((row) => {
      row.forEach((tile) => {
        if (tile.type === "core" && eIds.has(tile.id)) {
          hasCoreEnergized = true;
        }
      });
    });
    return hasCoreEnergized;
  };

  /**
   * Action when a tile is clicked. Represents rotation in Rotate mode,
   * or entanglement connection/disconnection in Link mode.
   */
  const handleRotate = (tx: number, ty: number) => {
    if (completed || collapsed) return;
    const clickedTile = board[ty][tx];
    if (clickedTile.type === "empty" || clickedTile.type === "obstacle") return;

    // --- CASE A: Linker Mode is ACTIVE ---
    if (linkModeActive) {
      if (clickedTile.locked) {
        // Can't link locked tiles (e.g. source/core)
        audio.playClick();
        return;
      }

      // If clicked tile already has a user-defined link, click it to SEVER/CLEAR it!
      if (clickedTile.entanglementId && clickedTile.entanglementId.startsWith("user-")) {
        const severId = clickedTile.entanglementId;
        const nextBoard = board.map((row) =>
          row.map((t) => {
            if (t.entanglementId === severId) {
              return { ...t, entanglementId: null, entanglementType: undefined };
            }
            return t;
          })
        );
        const { energizedIds: nextEnergized } = propagateCoherence(nextBoard);
        setBoard(nextBoard);
        setEnergizedIds(nextEnergized);
        audio.playClick();
        setSelectedTileId(null);
        setAiChat((prev) => [
          ...prev,
          {
            id: `sever-${Date.now()}`,
            sender: "erwin",
            text: "✂️【量子もつれ：デカップリング完了】\nノード [Y:" + clickedTile.y + ", X:" + clickedTile.x + "] 配下のもつれリンク（" + (severId.includes("inverse") ? "逆相 Φ⁻" : "同相 Φ⁺") + "）を切断したニャ。確率波は再び独立し、単独での回転操作が可能ニャ。",
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        return;
      }

      // If no tile is currently selected for linking:
      if (!selectedTileId) {
        setSelectedTileId(clickedTile.id);
        audio.playClick();
        return;
      }

      // If clicked the same selected tile: deselect it
      if (selectedTileId === clickedTile.id) {
        setSelectedTileId(null);
        audio.playClick();
        return;
      }

      // We have a first tile and a second clicked tile! Connect them!
      const parts = selectedTileId.split("-");
      const sX = parseInt(parts[1], 10);
      const sY = parseInt(parts[2], 10);
      const tile1 = board[sY][sX];

      // Limit check: maximum 4 custom user links are allowed
      const uniqueUserLinks = new Set<string>();
      board.forEach((r) => r.forEach((t) => {
        if (t.entanglementId && t.entanglementId.startsWith("user-")) {
          uniqueUserLinks.add(t.entanglementId);
        }
      }));

      if (uniqueUserLinks.size >= 4) {
        setAiChat((prev) => [
          ...prev,
          {
            id: `err-link-${Date.now()}`,
            sender: "erwin",
            text: `⚠️【量子もつれ上限】吾輩のスタビライザーは一度に最大4ペア（最大8つのノード）しかもつれ制御を維持できないニャ！不要な結合があれば先にタップして切断（デカップリング）してほしいニャ。`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        setSelectedTileId(null);
        audio.playClick();
        return;
      }

      // Build unique link ID
      const userLinkId = `user-${linkModeType}-${Date.now()}`;

      const nextBoard = board.map((row) =>
        row.map((t) => {
          if (t.id === tile1.id || t.id === clickedTile.id) {
            return {
              ...t,
              entanglementId: userLinkId,
              entanglementType: linkModeType,
            };
          }
          return t;
        })
      );

      const { energizedIds: nextEnergized } = propagateCoherence(nextBoard);
      setBoard(nextBoard);
      setEnergizedIds(nextEnergized);
      setSelectedTileId(null);
      audio.playQuantumEntangled();

      // Report link establishment
      setAiChat((prev) => [
        ...prev,
        {
          id: `link-create-${Date.now()}`,
          sender: "erwin",
          text: "🔗【量子同期もつれ 結合成功！】\nノード [Y:" + tile1.y + ", X:" + tile1.x + "] と [Y:" + clickedTile.y + ", X:" + clickedTile.x + "] を「" + (linkModeType === "direct" ? "同相同期 (Φ⁺)" : "逆相同期 (Φ⁻") + "」で接続したニャ！\nこれでお互いのスピン（回転）が結合され、一対となって動作する。自作のアライメント光路を上手く編み出して、コアへエネルギーを導くのだ！",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    // --- CASE B: Linker Mode is INACTIVE (Rotate Mode) ---
    if (clickedTile.locked) return;

    // Save action context to Undo Stack
    setUndoStack((prev) => [...prev, board.map((row) => row.map((t) => t.rotation))]);

    // Compute active links count on field
    const activeLinksCount = (() => {
      const uniqueUserLinks = new Set<string>();
      board.forEach((r) => r.forEach((t) => {
        if (t.entanglementId && t.entanglementId.startsWith("user-")) {
          uniqueUserLinks.add(t.entanglementId);
        }
      }));
      return uniqueUserLinks.size;
    })();

    // Compute stability cost: more links carry more quantum decoherence maintenance tax!
    const linkPenaltyFactor = 1 + (activeLinksCount * 0.45);
    const baseStabilityCost = Math.ceil(100 / (activeLevel.parMoves * 1.8));
    const stabilityCost = Math.ceil(baseStabilityCost * linkPenaltyFactor);
    const nextStability = Math.max(0, coherenceStability - stabilityCost);
    setCoherenceStability(nextStability);

    // Construct next grid layout
    const isEntangled = clickedTile.entanglementId !== null;
    const clickRotationStep = 90;

    const nextBoard = board.map((row, y) =>
      row.map((tile, x) => {
        if (tile.id === clickedTile.id) {
          return {
            ...tile,
            rotation: (tile.rotation + clickRotationStep) % 360,
          };
        }

        // Apply entangled reaction
        if (isEntangled && tile.entanglementId === clickedTile.entanglementId) {
          const rotationOffset =
            tile.entanglementType === "inverse" ? -clickRotationStep : clickRotationStep;
          return {
            ...tile,
            rotation: (tile.rotation + rotationOffset + 360) % 360,
          };
        }

        return tile;
      })
    );

    const { energizedIds: nextEnergized } = propagateCoherence(nextBoard);
    const win = checkCompletion(nextEnergized, nextBoard);

    setBoard(nextBoard);
    setEnergizedIds(nextEnergized);
    setMoveCount((prev) => prev + 1);

    if (isEntangled) {
      audio.playQuantumEntangled();
    } else {
      audio.playClick();
    }

    if (win && !completed) {
      setCompleted(true);
      audio.playWin();

      const levelPar = activeLevel?.parMoves || 10;
      const moves = moveCount + 1;
      let starResult = "★★★ 完璧ニャ！自作の量子リンクアライメント、恐るべき閃きニャ！";
      if (moves > levelPar + 2) starResult = "★ コヒーレンスは保たれたが不純物が多いニャ。不要な同期リンクを間引いて最適化をねらうニャ！";
      else if (moves > levelPar) starResult = "★★ 概ね良好。もつれの切断・接続タイミングを完全に制御しきればパー達成ニャ！";

      setAiChat((prev) => [
        ...prev,
        {
          id: `victory-${Date.now()}`,
          sender: "erwin",
          text: "🎉【量子共鳴の調和 完了！】\n手動結合を含む手数：" + moves + "手 (目標：" + levelPar + "手)\n量子評価：" + starResult + "\nノードから極上の波動が出ているニャ！",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else if (nextStability === 0) {
      setCollapsed(true);
      audio.playCollapse();
      setAiChat((prev) => [
        ...prev,
        {
          id: `collapse-${Date.now()}`,
          sender: "erwin",
          text: "⚠️【量子デコヒーレンス崩壊が発生したニャ！】\n無秩序に回転させすぎたか、もしくは繋ぎすぎた量子リンク（リンク数×1.45倍負荷ペナルティ）によるコヒーレンスペースの圧迫が原因ニャ。\n1つ戻すか、一度リセットして、もつれ回路をスマートに最適化するのだ！",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  /**
   * Reset current board state
   */
  const handleReset = () => {
    loadLevel(activeLevel);
    audio.playClick();
  };

  /**
   * Undo last operation
   */
  const handleUndo = () => {
    if (undoStack.length === 0 || completed) return;
    const prevRotations = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    const restoredBoard = board.map((row, y) =>
      row.map((tile, x) => ({
        ...tile,
        rotation: prevRotations[y][x],
      }))
    );

    const { energizedIds: nextEnergized } = propagateCoherence(restoredBoard);

    setBoard(restoredBoard);
    setEnergizedIds(nextEnergized);
    const stabilityCost = Math.ceil(100 / (activeLevel.parMoves * 1.8));
    setCoherenceStability((prev) => Math.min(100, prev + stabilityCost));
    setCollapsed(false);
    setMoveCount((prev) => Math.max(0, prev - 1));
    audio.playClick();
  };

  /**
   * Serialize current grid details dynamically for Gemini prompt
   */
  const serializeBoardState = () => {
    let summary = "現在プレイ中のレベル名: \"" + activeLevel.name + "\"\n" +
      "テーマの量子概念: \"" + activeLevel.quantumConcept + "\"\n" +
      "現在の移動手数: " + moveCount + "手 / 目標手数 (Par): " + activeLevel.parMoves + "手\n" +
      "グリッド次元: " + activeLevel.width + "x" + activeLevel.height + "マス\n\n" +
      "盤面の粒子情報 ( energized: true/false はエネルギー電流量を表す ):\n";

    board.forEach((row, y) => {
      row.forEach((t) => {
        if (t.type === "empty") return;
        const currentPorts = getAbsolutePorts(t.initialPorts, t.rotation);
        const energized = energizedIds.has(t.id);
        summary += `- ノード [Y:${t.y}, X:${t.x}] (タイプ: ${t.type}, 現在の回転状態: ${t.rotation}度, 有効な光路ポート: [${currentPorts.join(",")}], 通電(energized): ${energized}`;

        if (t.entanglementId) {
          summary += `, 量子もつれグループ: ${t.entanglementId} (連動方式: ${t.entanglementType})`;
        }
        summary += ")\n";
      });
    });

    summary += "\n【攻略目標】: \"source\"ノードから発せられる青い光（通電状態）が、\"core\"ノード（コア）に繋がればパズルクリア。\n" +
      "現在、コアは " + (checkCompletion(energizedIds, board) ? "稼働(energized: TRUE)" : "休止中(energized: FALSE)") + " です。";

    return summary;
  };

  /**
   * Requests Erwin's advice for the current level (Calls server-side API /api/hint)
   */
  const handleRequestHint = async () => {
    if (isThinkingAI || completed) return;

    // Fast-append a player-asking notification
    const playerMsg: AIMessage = {
      id: `ask-hint-${Date.now()}`,
      sender: "player",
      text: "エルヴィン教授、このパズルのコヒーレンス光路を最適化するためのヒントをスキャンしてほしいニャ！",
      timestamp: new Date().toLocaleTimeString(),
    };

    setAiChat((prev) => [...prev, playerMsg]);
    setIsThinkingAI(true);

    try {
      const summary = serializeBoardState();
      const response = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelName: activeLevel.name,
          quantumConcept: activeLevel.quantumConcept,
          moveCount,
          parMoves: activeLevel.parMoves,
          boardStateSummary: summary,
          chatHistory: aiChat.slice(-5), // pass latest conversations
        }),
      });

      if (!response.ok) throw new Error("API failed");
      const data = await response.json();

      setAiChat((prev) => [
        ...prev,
        {
          id: `hint-${Date.now()}`,
          sender: "erwin",
          text: data.text,
          timestamp: new Date().toLocaleTimeString(),
          isHint: true,
        },
      ]);
    } catch (err) {
      console.error(err);
      setAiChat((prev) => [
        ...prev,
        {
          id: `hint-err-${Date.now()}`,
          sender: "erwin",
          text: "吾輩のプランク定数が乱れたようだ！量子トンネル通信にノイズが発生した。もう一度診断を申請するニャ。",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsThinkingAI(false);
    }
  };

  /**
   * Custom text dialogue option with Erwin
   */
  const handleSendMessage = async (text: string) => {
    if (isThinkingAI || completed || !text.trim()) return;

    const playerMsg: AIMessage = {
      id: `player-msg-${Date.now()}`,
      sender: "player",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setAiChat((prev) => [...prev, playerMsg]);
    setIsThinkingAI(true);

    try {
      const boardSummary = serializeBoardState();
      // Ask Gemini for normal conversational response
      const response = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelName: activeLevel.name,
          quantumConcept: activeLevel.quantumConcept,
          moveCount,
          parMoves: activeLevel.parMoves,
          boardStateSummary: "【質問】: \"" + text + "\"\n\n【最新盤面状態】:\n" + boardSummary,
          chatHistory: aiChat.slice(-5),
        }),
      });

      if (!response.ok) throw new Error("API failure");
      const data = await response.json();

      setAiChat((prev) => [
        ...prev,
        {
          id: `erwin-ans-${Date.now()}`,
          sender: "erwin",
          text: data.text,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setAiChat((prev) => [
        ...prev,
        {
          id: `erwin-err-${Date.now()}`,
          sender: "erwin",
          text: "量子もつれの観測結果、波動関数が収縮に失敗した。吾輩をお呼びの際は分かりやすい言葉にしてくれると助かるニャ！",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsThinkingAI(false);
    }
  };

  /**
   * Generates a completely new Level Config using server-side Gemini (/api/generate-level)
   */
  const handleSynthesizeLevel = async () => {
    if (isSynthesizingLevel) return;
    setIsSynthesizingLevel(true);

    // Dynamic greeting
    setAiChat((prev) => [
      ...prev,
      {
        id: `synth-start-${Date.now()}`,
        sender: "erwin",
        text: "【超空間コヒーレンス光の合成中】\n現在、Gemini-3.5-Flashを媒介として 難易度:" + generationDifficulty + " の全新量子パズルレベルを合成しているニャ！ 確率波が励起するのを心待ちにするのだ。",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    try {
      const response = await fetch("/api/generate-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: generationDifficulty }),
      });

      if (!response.ok) throw new Error("Level generation failed");
      const generatedLevelConfig: LevelConfig = await response.json();

      // Assure exact, valid format
      const refinedLevel: LevelConfig = {
        ...generatedLevelConfig,
        id: levels.length + 1,
        // sanitize blank strings back to null under tiles
        tiles: generatedLevelConfig.tiles.map((t) => ({
          ...t,
          entanglementId: t.entanglementId === "" ? null : t.entanglementId,
        })),
      };

      // Register the level
      setLevels((prev) => [...prev, refinedLevel]);
      setCurrentLevelIdx(levels.length); // trigger load
      audio.playQuantumEntangled();

    } catch (err) {
      console.error(err);
      setAiChat((prev) => [
        ...prev,
        {
          id: `synth-fail-${Date.now()}`,
          sender: "erwin",
          text: "量子合成の干渉縞にエラーが起きたニャ。次元の波長が乱れ、確率レベルの結晶化に失敗した。もう一度トライしてほしいのだ！",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsSynthesizingLevel(false);
    }
  };

  // Skip / Navigation functions
  const handleNextLevel = () => {
    if (currentLevelIdx < levels.length - 1) {
      setCurrentLevelIdx((prev) => prev + 1);
    }
  };

  const handlePrevLevel = () => {
    if (currentLevelIdx > 0) {
      setCurrentLevelIdx((prev) => prev - 1);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden pb-12">
      {/* Background Ambience Aura */}
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header Container */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between border-b border-slate-800/40 relative z-10 gap-4">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-cyan-400 mb-1">
            <Cpu className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span className="text-xs uppercase tracking-[0.25em] font-mono font-bold">Unprecedented Logic</span>
          </div>
          <h1 className="text-3xl font-sans tracking-tight font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            EntangLO <span className="font-light text-slate-400 text-lg">:: 量子もつれパズル</span>
          </h1>
        </div>

        {/* Master Control Board */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 shadow-md cursor-pointer transition-all active:scale-95"
            id="open-manual-btn"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            量子マニュアルを開く
          </button>

          {/* Core Info badge */}
          <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">Coherence Engine</span>
          </div>
        </div>
      </header>

      {/* Main Grid Viewport */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 relative z-10">
        {/* Playable Stage Area (7 / 12 width) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Level Header Info */}
          <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800/80 backdrop-blur-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase bg-slate-950/90 text-purple-400 px-2 py-0.5 rounded-md border border-purple-500/20 font-bold mb-1.5 inline-block">
                  {activeLevel.quantumConcept}
                </span>
                <h2 className="text-xl font-bold font-sans text-slate-200">
                  {activeLevel.id}. {activeLevel.name}
                </h2>
              </div>

              {/* Par / Current Moves Display */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/90 py-2.5 px-4 rounded-2xl border border-slate-850">
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-12 border-r border-slate-800 pr-3">
                    <span className="text-[10px] font-mono uppercase tracking-tight text-slate-500 block">Moves</span>
                    <span className="text-base font-semibold font-mono tracking-tighter text-cyan-400">{moveCount}</span>
                  </div>
                  <div className="text-center min-w-12">
                    <span className="text-[10px] font-mono uppercase tracking-tight text-slate-500 block">Goal / Par</span>
                    <span className="text-base font-semibold font-mono tracking-tighter text-slate-300">{activeLevel.parMoves}</span>
                  </div>
                </div>

                {/* Coherence level slider for protection against spamming */}
                <div className="flex flex-col min-w-32 border-t sm:border-t-0 sm:border-l border-slate-850 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1 gap-4">
                    <span className="text-slate-500 uppercase tracking-tight">Coherence</span>
                    <span className={`font-semibold ${
                      coherenceStability >= 75
                        ? "text-cyan-400"
                        : coherenceStability >= 35
                        ? "text-amber-400"
                        : coherenceStability > 0
                        ? "text-rose-500 animate-pulse font-bold"
                        : "text-red-600 font-extrabold animate-pulse"
                    }`}>
                      {coherenceStability}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        coherenceStability >= 75
                          ? "bg-cyan-500"
                          : coherenceStability >= 35
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${coherenceStability}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Level Selector Navigator Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/40 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevLevel}
                  disabled={currentLevelIdx === 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  id="prev-btn"
                >
                  前へ
                </button>
                <span className="font-mono text-slate-400 px-2">
                  {currentLevelIdx + 1} / {levels.length}
                </span>
                <button
                  onClick={handleNextLevel}
                  disabled={currentLevelIdx === levels.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  id="next-btn"
                >
                  次へ
                </button>
              </div>

              {/* Utility Tools */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0 || completed}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  id="undo-btn"
                  title="Undo last action [Z]"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  戻す
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
                  id="reset-btn"
                  title="Reset Stage [R]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  リセット
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Core Grid Board */}
          <div className="relative">
            <WaveguideGrid
              board={board}
              energizedIds={energizedIds}
              onRotate={handleRotate}
              hoveredEntanglement={hoveredEntanglement}
              setHoveredEntanglement={setHoveredEntanglement}
              selectedTileId={selectedTileId}
            />

            {/* Victory overlay banner inside stages */}
            <AnimatePresence>
              {completed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    className="p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center shadow-2xl max-w-sm"
                  >
                    <Trophy className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
                    <h3 className="text-xl font-extrabold text-slate-100">コヒーレンス開通！</h3>
                    <p className="text-[11px] text-slate-400 uppercase tracking-widest font-mono mb-4 text-emerald-400">
                      Coherence Connected :: STARRED
                    </p>

                    <div className="bg-slate-950 rounded-xl px-4 py-3 border border-slate-850 w-full flex items-center justify-between mb-5 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-left text-[10px]">TOTAL MOVES</span>
                        <span className="text-slate-200">{moveCount}手</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">STAR RATING</span>
                        <span className="text-amber-300 font-sans font-bold">
                          {moveCount <= activeLevel.parMoves
                            ? "★★★ (Perfect)"
                            : moveCount <= activeLevel.parMoves + 2
                            ? "★★☆ (Excellent)"
                            : "★☆☆ (Cleared)"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleReset}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-750 transition-all cursor-pointer"
                      >
                        リプレイ
                      </button>
                      <button
                        onClick={currentLevelIdx < levels.length - 1 ? handleNextLevel : () => {}}
                        disabled={currentLevelIdx === levels.length - 1}
                        className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-bold text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        次のレベル
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapse overlay banner if stability hits 0% */}
            <AnimatePresence>
              {collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-red-950/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    className="p-8 bg-slate-950 border border-rose-500/30 rounded-3xl flex flex-col items-center shadow-2xl max-w-sm"
                  >
                    <AlertCircle className="w-12 h-12 text-rose-500 mb-3 animate-pulse" />
                    <h3 className="text-xl font-extrabold text-rose-500">コヒーレンス崩壊！</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-4 text-rose-400">
                      Coherence Stability : 0%
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      無秩序な回転操作によって、もつれ回路内のデコヒーレンス（量子熱雑音）が許容閾値を超え、確率アライメントが消失しました。
                    </p>

                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleUndo}
                        disabled={undoStack.length === 0}
                        className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                      >
                        <Undo2 className="w-3.5 h-3.5 text-cyan-400" />
                        1手戻す
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-650 hover:from-rose-600 hover:to-red-550 text-xs font-bold text-white transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-rose-200 animate-spin" style={{ animationDuration: "6s" }} />
                        リセット
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quantum Link Composer UI card */}
          <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800/80 backdrop-blur-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2 text-left">
                <div className={`p-1.5 rounded-lg border transition-all pointer-events-none mt-0.5 ${
                  linkModeActive 
                    ? "bg-cyan-950/50 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]" 
                    : "bg-slate-950 border-slate-850 text-slate-500"
                }`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">
                    量子リンク・コンポーザー (自己もつれ結合)
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    お互いに同期・もつれさせたい２つのノードを自分自身で自由に選択・指定できるニャ！
                  </p>
                </div>
              </div>

              {/* Status Indicator Badge */}
              <div className={`text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-md border shrink-0 text-center ${
                linkModeActive
                  ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-400 animate-pulse"
                  : "bg-slate-950 border-slate-850 text-slate-500"
              }`}>
                {linkModeActive ? "LINK INJECTION ACTIVE" : "STANDBY"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Toggle switch for linking tool */}
              <div className="md:col-span-5 flex gap-2 w-full">
                <button
                  onClick={() => {
                    const nextActive = !linkModeActive;
                    setLinkModeActive(nextActive);
                    setSelectedTileId(null);
                    audio.playClick();
                    if (nextActive) {
                      setAiChat((prev) => [
                        ...prev,
                        {
                          id: `link-mode-on-${Date.now()}`,
                          sender: "erwin",
                          text: `🛠️【リンク構築モード：起動】
もつれさせたい2つのノードを順に選んで、人工的なもつれ結合（同期）を形成するニャ！
結合の種類も「同相 (Φ⁺)」か「逆相 (Φ⁻)」から選べるニャ。ただし、リンク中は1回転ごとにデコヒーレンス維持経費ペナルティ（1リンクあたり熱雑音+45％加算）がかかるハイリスク＆ハイリターン仕様だニャ！`,
                          timestamp: new Date().toLocaleTimeString(),
                        },
                      ]);
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border ${
                    linkModeActive
                      ? "bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] font-extrabold"
                      : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-350"
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${linkModeActive ? "animate-bounce" : ""}`} />
                  {linkModeActive ? "リンク構築モード終了" : "リンク構築モードを起動"}
                </button>
              </div>

              {/* Coupling Selector (Direct/Inverse sync) */}
              <div className="md:col-span-4 flex bg-slate-950 p-1 rounded-xl border border-slate-850 gap-1 w-full">
                <button
                  onClick={() => {
                    setLinkModeType("direct");
                    audio.playClick();
                  }}
                  disabled={!linkModeActive}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
                    linkModeType === "direct" && linkModeActive
                      ? "bg-sky-500/20 border border-sky-550/30 text-sky-400"
                      : "text-slate-400 hover:text-slate-350"
                  }`}
                >
                  <span className="font-bold font-mono">Φ⁺ 同相</span>
                  <span className="text-[8px] px-1 rounded bg-slate-900 border border-slate-800 text-sky-400 shrink-0">同調</span>
                </button>
                <button
                  onClick={() => {
                    setLinkModeType("inverse");
                    audio.playClick();
                  }}
                  disabled={!linkModeActive}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
                    linkModeType === "inverse" && linkModeActive
                      ? "bg-rose-500/20 border border-rose-550/30 text-rose-400"
                      : "text-slate-400 hover:text-slate-350"
                  }`}
                >
                  <span className="font-bold font-mono">Φ⁻ 逆相</span>
                  <span className="text-[8px] px-1 rounded bg-slate-900 border border-slate-800 text-rose-400 shrink-0">逆調</span>
                </button>
              </div>

              {/* Reset/Sever link buttons */}
              <div className="md:col-span-3 flex gap-2 w-full">
                <button
                  onClick={() => {
                    // Sever all user connections
                    const nextBoard = board.map((row) =>
                      row.map((tile) => {
                        if (tile.entanglementId && tile.entanglementId.startsWith("user-")) {
                          return { ...tile, entanglementId: null, entanglementType: undefined };
                        }
                        return tile;
                      })
                    );
                    const { energizedIds: nextEnergized } = propagateCoherence(nextBoard);
                    setBoard(nextBoard);
                    setEnergizedIds(nextEnergized);
                    setSelectedTileId(null);
                    audio.playClick();
                    setAiChat((prev) => [
                      ...prev,
                      {
                        id: `clear-links-${Date.now()}`,
                        sender: "erwin",
                        text: `🧹【量子全結合を初期化】
構築していたすべての人工もつれリンクを解除（デカップリング）したニャ。熱ペナルティが解除され、本来の静寂が回復したニャ！`,
                        timestamp: new Date().toLocaleTimeString(),
                      },
                    ]);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-350 hover:text-slate-100 text-[11px] font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  全リンク解除
                </button>
              </div>
            </div>

            {/* Hint alert showing complexity mechanics under state */}
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-850/60 text-[10px] text-slate-400 leading-normal text-left">
              {linkModeActive ? (
                <p className="flex items-start gap-1 text-cyan-300 font-mono">
                  <span className="text-cyan-400 animate-pulse">💡</span>
                  <span>
                    【リンク接続手順】: 1つ目のノードを選択し（青い点滅状態）、次にもう1つのノードを選択すると同期もつれが形成されます。すでに青い鎖で繋がっているノード自体をタップすると、その接続のみを切断できます。
                  </span>
                </p>
              ) : (
                <p className="flex items-start gap-1">
                  <span>💡</span>
                  <span>
                    【コヒーレンス税（高難易度ペナルティ）】: 自由なもつれリンクは強力ですが、1リンク（1カップル）維持するごとに回転消費時のCoherence Stability消耗が <strong className="text-rose-400 font-bold">+45%激増</strong> します！不要になったら「全リンク解除」や個別タップで積極的に切って、無駄のないアライメントで極限解決を目指すニャ。
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* AI Custom Level Synthesizer control card */}
          <div className="bg-slate-900/30 border border-slate-850 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3 text-left">
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-400 mt-0.5 pointer-events-none">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">量子AIレベル・シンセサイザー</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-sm mt-0.5">
                  エルヴィンが超空間に干渉し、完璧かつクリア可能な新しいもつれパズルをGemini-3.5-Flashでリアルタイムに無限生成するニャ！
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
              {/* Difficulty Select */}
              <select
                value={generationDifficulty}
                onChange={(e) => setGenerationDifficulty(e.target.value as any)}
                disabled={isSynthesizingLevel}
                className="bg-slate-950 text-slate-300 text-xs rounded-xl border border-slate-800 px-3 py-2 outline-none focus:border-purple-500 disabled:opacity-40 transition-all"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <button
                onClick={handleSynthesizeLevel}
                disabled={isSynthesizingLevel || completed}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-xs font-bold text-white shadow-md disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
                id="synthesize-level-btn"
              >
                {isSynthesizingLevel ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    空間を重ね合わせ中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                    新規レベル生成ニャ！
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* AI Diagnostics Advisor Panel (5 / 12 width) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <AIPanel
            chatHistory={aiChat}
            isThinking={isThinkingAI}
            onSendMessage={handleSendMessage}
            onRequestHint={handleRequestHint}
            gameCompleted={completed}
            activeLevelName={activeLevel?.name || "Initializing..."}
          />

          {/* Game rules outline card */}
          <div className="bg-slate-900/20 p-4 rounded-2xl border border-slate-800/60 text-left">
            <h4 className="text-[11px] font-bold font-mono tracking-wider text-slate-400 flex items-center gap-1.5 uppercase mb-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Entanglement Quick Lookup
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
              <div className="p-2 py-1.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                <span className="font-bold text-purple-400">α, β (同相グループ)</span>
                <span className="block mt-0.5 leading-normal">直接もつれ。同期した時計回り運動を保ちます。</span>
              </div>
              <div className="p-2 py-1.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                <span className="font-bold text-rose-400">± (異相グループ)</span>
                <span className="block mt-0.5 leading-normal">反時計回りの逆連動。交互のアライメント計画を考案せよ。</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pop-up manual guidelines */}
      <RuleOverlay isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
