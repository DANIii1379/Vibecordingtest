/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Shared Gemini client setup (using process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route 1: Erwin's Diagnostics (AI Hints)
  app.post("/api/hint", async (req, res) => {
    try {
      const { levelName, quantumConcept, moveCount, parMoves, boardStateSummary, chatHistory } = req.body;

      const systemInstruction = `あなたは量子力学パズルゲーム「EntangLO (エンタングロー)」のホログラフィックAIアドバイザー、量子力学猫の「エルヴィン教授 (Erwin)」です。
物理学者シュレーディンガーの飼い猫であり、高度な知性と少しユーモラスなプライドを持っています。
一人称は「吾輩」または「私」で、語尾は「〜である」「〜かね？」「〜なのだニャ」などの学術的かつ親しみやすい猫口調にしてください。
現在のプレイヤーの盤面状態を分析し、ユーモアを交えて知的で実用的なアドバイス・ヒントを日本語で提供してください。
直接的な答え（例：「tile-2-1を2回クリックする」）を教え込むのではなく、もつれた粒子の関係性や、どのポートが開いているか、どういう順序で電流（コヒーレンス光）を通せばよいかの「手がかり」を、量子力学の比喩（重ね合わせ、観測問題、エンタングルメント、ベルの不等式など）を用いてエレガントにアドバイスしてください。`;

      const prompt = `【現在のレベル】: ${levelName} (${quantumConcept})
【手数 / 目標手数】: ${moveCount} / ${parMoves}
【現在の盤面情報】:
${boardStateSummary}

【これまでのあなたの対話履歴】:
${JSON.stringify(chatHistory || [])}

プレイヤーに120文字から200文字程度で、次にとるべき戦術的なアプローチについて、量子キャットとしての温かくもマニアックな助言をしてください。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.8,
        },
      });

      const responseText = response.text || "コヒーレンスが乱れて接続が途切れたニャ。もう一度送ってみてくれ。";
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Error at /api/hint:", error);
      res.status(500).json({ error: "量子もつれの観測に失敗しました。エルヴィンのコヒーレンスが破棄されました。" });
    }
  });

  // API Route 2: AI Quantum Level Synthesizer
  app.post("/api/generate-level", async (req, res) => {
    try {
      const { difficulty } = req.body; // "Easy", "Medium", "Hard"

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a themed, highly playable, and physically interesting Quantum Entanglement puzzle level for standard 4x4 or 5x5 grid puzzle "EntangLO".
The level difficulty should be: ${difficulty}.

Requirements:
1. It must contain exactly:
   - 1 "source" tile (emits light waveguide). It should typically be at x: 0 or the edge.
   - 1 "core" tile (receives light beam). It should be at x: width-1 or opposite edge.
   - At least 2 pairs of entangled tiles (sharing entanglementId e.g. "A", "B").
     At least one tile in the entangled pairs must be 'inverse' (or 'direct') entanglementType.
   - Other tiles should be "normal" waveguides (straight connectors e.g., ["up", "down"], or corner connectors e.g., ["right", "down"]), or "empty".
2. The puzzle must be solvable! There should exist a sequence of rotations where the light flows from source to core.
3. Make the concept sound physical and futuristic.
4. Level size must be around 4x4 (width: 4, height: 4) to 5x5.
5. All tiles must have consistent x (from 0 to width-1) and y (from 0 to height-1) positions.
6. Under entanglementId, if there is no entanglement, use empty string "".

Use this strict JSON schema to reply. Do not include markdown tags.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "日本のSFゲームらしい洗練されたレベル名 (例: 'ベルの量子共鳴', '二重複路の重ね合わせ')" },
              description: { type: Type.STRING, description: "日本語によるこのレベルのフレーバーテキストと攻略ヒント" },
              difficulty: { type: Type.STRING, description: "Easy, Medium, Hard" },
              quantumConcept: { type: Type.STRING, description: "このレベルがテーマとする物理・量子用語 (例: 'Quantum Coherence', 'Action at a Distance')" },
              width: { type: Type.INTEGER, description: "グリッドの幅 (4〜5)" },
              height: { type: Type.INTEGER, description: "グリッドの高さ (4〜5)" },
              parMoves: { type: Type.INTEGER, description: "目標手数 (4〜15)" },
              tiles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "一意のID (例: 'tile-0-0')" },
                    x: { type: Type.INTEGER, description: "0から始まるグリッド横インデックス" },
                    y: { type: Type.INTEGER, description: "0から始まるグリッド縦インデックス" },
                    type: { type: Type.STRING, description: "empty, normal, source, core, obstacle" },
                    initialPorts: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "基準回転角(0度)におけるポート方向 (例: 'up', 'right', 'down', 'left')"
                    },
                    rotation: { type: Type.INTEGER, description: "初期回転状態: 0, 90, 180, 270" },
                    entanglementId: { type: Type.STRING, description: "もつれID (もつれていない場合は空文字 '')" },
                    entanglementType: { type: Type.STRING, description: "もつれ動作: direct または inverse" },
                    locked: { type: Type.BOOLEAN, description: "固定されて直接回転できないか (source, coreは通常true、障害物もtrue、normalは通常false)" }
                  },
                  required: ["id", "x", "y", "type", "initialPorts", "rotation", "locked"]
                }
              }
            },
            required: ["name", "description", "difficulty", "quantumConcept", "width", "height", "parMoves", "tiles"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini server");
      }
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Error at /api/generate-level:", error);
      res.status(500).json({ error: "量子レベルの結合に失敗しました。確率波が崩壊しました。" });
    }
  });

  // Vite development middleware vs Static Production files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EntangLO App Server] Listening at http://localhost:${PORT}`);
  });
}

startServer();
