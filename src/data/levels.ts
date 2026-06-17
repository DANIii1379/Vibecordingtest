/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig } from "../types";

export const levels: LevelConfig[] = [
  {
    id: 1,
    name: "ベルの初まりと対鎖 (Bell's Start & Pair Link)",
    description: "量子世界の扉へようこそ。同じマークのタイルは【直接もつれ】ており、片方をクリックするともう片方も同じ方向に回転する。両方を綺麗に繋げる角を探すニャ！",
    difficulty: "Easy",
    quantumConcept: "Bell State (ベル状態)",
    width: 4,
    height: 4,
    parMoves: 4,
    tiles: [
      { id: "tile-0-1", x: 0, y: 1, type: "source", initialPorts: ["right"], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-1", x: 1, y: 1, type: "normal", initialPorts: ["left", "right"], rotation: 90, entanglementId: "alpha", entanglementType: "direct", locked: false },
      { id: "tile-2-1", x: 2, y: 1, type: "normal", initialPorts: ["left", "right"], rotation: 90, entanglementId: "alpha", entanglementType: "direct", locked: false },
      { id: "tile-3-1", x: 3, y: 1, type: "core", initialPorts: ["left"], rotation: 0, entanglementId: null, locked: true },
      // Empty padding for 4x4
      { id: "tile-0-0", x: 0, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-0", x: 1, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-0", x: 2, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-0", x: 3, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-2", x: 0, y: 2, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-2", x: 1, y: 2, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-2", x: 2, y: 2, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-2", x: 3, y: 2, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-3", x: 0, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-3", x: 1, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-3", x: 2, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-3", x: 3, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
    ]
  },
  {
    id: 2,
    name: "逆相の揺らぎ (Inverse Vibrations)",
    description: "このレベルでは【逆もつれ(Inverse)】が発生している。あなたが一方を時計回りに回すと、もう一方は【反時計回り】に回る！ 互い違いにそっぽを向く二つの対をうまく調和させるニャ。",
    difficulty: "Easy",
    quantumConcept: "Anti-Correlation (異相関)",
    width: 4,
    height: 4,
    parMoves: 5,
    tiles: [
      { id: "tile-0-1", x: 0, y: 1, type: "source", initialPorts: ["right"], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-1", x: 1, y: 1, type: "normal", initialPorts: ["left", "down"], rotation: 0, entanglementId: "beta", entanglementType: "inverse", locked: false },
      { id: "tile-1-2", x: 1, y: 2, type: "normal", initialPorts: ["up", "right"], rotation: 0, entanglementId: "beta", entanglementType: "inverse", locked: false },
      { id: "tile-2-2", x: 2, y: 2, type: "normal", initialPorts: ["left", "right"], rotation: 90, entanglementId: null, locked: false },
      { id: "tile-3-2", x: 3, y: 2, type: "core", initialPorts: ["left"], rotation: 0, entanglementId: null, locked: true },
      // Padding
      { id: "tile-0-0", x: 0, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-0", x: 2, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-0", x: 3, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-1", x: 2, y: 1, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-1", x: 3, y: 1, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-2", x: 0, y: 2, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-3", x: 0, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-3", x: 1, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-3", x: 2, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-3", x: 3, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
    ]
  },
  {
    id: 3,
    name: "GHZ 三体結合 (GHZ Tripartite Entanglement)",
    description: "量子もつれは２つだけとは限らないニャ！ なんと３つの導波路が連動（GHZもつれ）している。1つを回すと、他の２つも同時に回る。奇跡の同期を起こすのだ。",
    difficulty: "Medium",
    quantumConcept: "GHZ State (グリーンバーガー＝ホーン＝ツァイリンガー状態)",
    width: 4,
    height: 4,
    parMoves: 6,
    tiles: [
      { id: "tile-0-0", x: 0, y: 0, type: "source", initialPorts: ["down"], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-1", x: 0, y: 1, type: "normal", initialPorts: ["down", "left"], rotation: 0, entanglementId: "ghz", entanglementType: "direct", locked: false },
      { id: "tile-1-1", x: 1, y: 1, type: "normal", initialPorts: ["right", "up"], rotation: 0, entanglementId: "ghz", entanglementType: "direct", locked: false },
      { id: "tile-1-2", x: 1, y: 2, type: "normal", initialPorts: ["down", "left"], rotation: 0, entanglementId: "ghz", entanglementType: "direct", locked: false },
      { id: "tile-2-2", x: 2, y: 2, type: "normal", initialPorts: ["up", "down"], rotation: 0, entanglementId: null, locked: false },
      { id: "tile-3-2", x: 3, y: 2, type: "core", initialPorts: ["left"], rotation: 0, entanglementId: null, locked: true },
      // Empty grid spaces
      { id: "tile-1-0", x: 1, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-0", x: 2, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-0", x: 3, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-1", x: 2, y: 1, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-1", x: 3, y: 1, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-2", x: 0, y: 2, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-3", x: 0, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-3", x: 1, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-3", x: 2, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-3", x: 3, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
    ]
  },
  {
    id: 4,
    name: "量子テレポーテーション路 (Quantum Teleportation Link)",
    description: "もつれ関係が入り乱れる格子。エリア中央の障害物(ブラックホール)を迂回し、上下のルートを通って量子状態を転送せよ。",
    difficulty: "Medium",
    quantumConcept: "Quantum Teleportation (量子テレポーテーション)",
    width: 4,
    height: 4,
    parMoves: 8,
    tiles: [
      { id: "tile-0-1", x: 0, y: 1, type: "source", initialPorts: ["right"], rotation: 0, entanglementId: null, locked: true },
      
      // Black hole in the core region but bypassable
      { id: "tile-2-2", x: 2, y: 2, type: "obstacle", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      
      // Path 1
      { id: "tile-1-1", x: 1, y: 1, type: "normal", initialPorts: ["left", "up", "right"], rotation: 180, entanglementId: "omega-1", entanglementType: "direct", locked: false },
      { id: "tile-1-0", x: 1, y: 0, type: "normal", initialPorts: ["down", "right"], rotation: 90, entanglementId: "omega-2", entanglementType: "inverse", locked: false },
      { id: "tile-2-0", x: 2, y: 0, type: "normal", initialPorts: ["left", "down"], rotation: 0, entanglementId: "omega-1", entanglementType: "direct", locked: false },
      { id: "tile-2-1", x: 2, y: 1, type: "normal", initialPorts: ["up", "down"], rotation: 90, entanglementId: "omega-2", entanglementType: "inverse", locked: false },
      { id: "tile-2-3", x: 2, y: 3, type: "normal", initialPorts: ["up", "right"], rotation: 0, entanglementId: null, locked: false },
      { id: "tile-3-1", x: 3, y: 1, type: "core", initialPorts: ["left"], rotation: 0, entanglementId: null, locked: true },
      
      // Padding empty
      { id: "tile-0-0", x: 0, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-0", x: 3, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-2", x: 0, y: 2, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-2", x: 1, y: 2, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-2", x: 3, y: 2, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-3", x: 0, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-3", x: 1, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-3", x: 3, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
    ]
  },
  {
    id: 5,
    name: "芝野のゼノン効果 (Quantum Zeno Obstacle)",
    description: "「観測し続ける限り、状態は変化しない」。このグリッドには絶対に回転させることができない固定障害タイルの「ゼノン」がある。障害を回避し、逆もつれ同士をうまく合致させる高次ルートを発見せよ。",
    difficulty: "Hard",
    quantumConcept: "Quantum Zeno Effect (ゼノン効果)",
    width: 5,
    height: 5,
    parMoves: 10,
    tiles: [
      { id: "tile-0-2", x: 0, y: 2, type: "source", initialPorts: ["right"], rotation: 0, entanglementId: null, locked: true },
      
      // Zeno obstacles
      { id: "tile-2-2", x: 2, y: 2, type: "obstacle", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-1", x: 2, y: 1, type: "obstacle", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      
      // Entangled logic
      { id: "tile-1-2", x: 1, y: 2, type: "normal", initialPorts: ["left", "up", "down"], rotation: 0, entanglementId: "zeno-a", entanglementType: "direct", locked: false },
      { id: "tile-1-1", x: 1, y: 1, type: "normal", initialPorts: ["down", "right"], rotation: 90, entanglementId: "zeno-b", entanglementType: "inverse", locked: false },
      { id: "tile-3-1", x: 3, y: 1, type: "normal", initialPorts: ["left", "down"], rotation: 180, entanglementId: "zeno-a", entanglementType: "direct", locked: false },
      { id: "tile-3-2", x: 3, y: 2, type: "normal", initialPorts: ["up", "right", "down"], rotation: 270, entanglementId: "zeno-b", entanglementType: "inverse", locked: false },
      
      // Normal conduits
      { id: "tile-1-3", x: 1, y: 3, type: "normal", initialPorts: ["up", "right"], rotation: 0, entanglementId: null, locked: false },
      { id: "tile-2-3", x: 2, y: 3, type: "normal", initialPorts: ["left", "right"], rotation: 90, entanglementId: null, locked: false },
      { id: "tile-3-3", x: 3, y: 3, type: "normal", initialPorts: ["left", "up"], rotation: 0, entanglementId: null, locked: false },
      
      { id: "tile-4-2", x: 4, y: 2, type: "core", initialPorts: ["left"], rotation: 0, entanglementId: null, locked: true },
      
      // Padding standard 5x5
      { id: "tile-0-0", x: 0, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-0", x: 1, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-0", x: 2, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-0", x: 3, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-4-0", x: 4, y: 0, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-1", x: 0, y: 1, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-4-1", x: 4, y: 1, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-3", x: 0, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-4-3", x: 4, y: 3, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-0-4", x: 0, y: 4, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-1-4", x: 1, y: 4, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-2-4", x: 2, y: 4, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-3-4", x: 3, y: 4, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
      { id: "tile-4-4", x: 4, y: 4, type: "empty", initialPorts: [], rotation: 0, entanglementId: null, locked: true },
    ]
  }
];
