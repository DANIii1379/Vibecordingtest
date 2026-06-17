/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { AIMessage } from "../types";
import { Send, Sparkles, AlertCircle, Bot, Zap } from "lucide-react";
import { motion } from "motion/react";

interface AIPanelProps {
  chatHistory: AIMessage[];
  isThinking: boolean;
  onSendMessage: (text: string) => void;
  onRequestHint: () => void;
  gameCompleted: boolean;
  activeLevelName: string;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  chatHistory,
  isThinking,
  onSendMessage,
  onRequestHint,
  gameCompleted,
  activeLevelName,
}) => {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  // Determine Erwin's ASCII face expression based on game/chat state
  const getErwinFace = () => {
    if (isThinking) return "(=ΦωΦ=) ✧ 「計算中...」";
    if (gameCompleted) return "(=｀ω´=) 🗲 「確率波、収束ニャ！！」";
    if (chatHistory.length > 1 && chatHistory[chatHistory.length - 1].sender === "erwin") {
      const lastText = chatHistory[chatHistory.length - 1].text;
      if (lastText.includes("お見事") || lastText.includes("クリア") || lastText.includes("美しい")) {
        return "(=^. .^=) 🎔 「コヒーレンスが高まっているニャ」";
      }
    }
    return "(=^•ﻌ•^=) 🥼 「ごきげんよう、観測者よ」";
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-900/40 rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-xl overflow-hidden">
      {/* Hologram Header */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-cyan-950/50 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
              <Zap className="w-2 h-2 text-white fill-white animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-sans font-medium text-slate-100 flex items-center gap-1.5">
              エルヴィン教授 <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded-full border border-cyan-500/20 font-mono">ADVISOR</span>
            </h3>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight">Active Waveguide Analyzer</p>
          </div>
        </div>

        {/* Dynamic Cat Hologram ASCII */}
        <div className="text-right hidden sm:block">
          <span className="text-xs font-mono font-bold text-cyan-400 block drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]">
            {getErwinFace()}
          </span>
          <span className="text-[9px] font-mono text-slate-500 tracking-widest block uppercase">Holo-Cat Observer v3.5</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800/50 m-2">
            <Bot className="w-8 h-8 text-slate-500 mb-2 animate-bounce" />
            <h4 className="text-xs font-semibold text-slate-300 mb-1">エルヴィンの量子診断室</h4>
            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
              「吾輩はシュレーディンガーの飼い猫である。コヒーレンス光路の接続にお困りと聞いて馳せ参じたニャ。疑問やヒントがあれば、遠慮なく聞いてくれたまえ。」
            </p>
          </div>
        )}

        {chatHistory.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === "player" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed relative shadow-md
                ${
                  msg.sender === "player"
                    ? "bg-cyan-600 text-white rounded-tr-none shadow-cyan-950/20"
                    : msg.isHint
                    ? "bg-purple-950/40 text-purple-200 border border-purple-500/30 rounded-tl-none shadow-purple-950/10"
                    : "bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/50"
                }
              `}
            >
              {/* Message Header for AI / Hint */}
              {msg.sender === "erwin" && (
                <div className="flex items-center gap-1 mb-1 font-semibold text-[10px] tracking-wider uppercase font-sans">
                  {msg.isHint ? (
                    <span className="text-purple-400 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> Quantum Hint
                    </span>
                  ) : (
                    <span className="text-cyan-400 flex items-center gap-0.5">
                      <Bot className="w-3 h-3" /> Professor Erwin
                    </span>
                  )}
                </div>
              )}
              
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
              
              {/* Optional diagnostics status overlay */}
              {msg.isHint && (
                <div className="mt-2 pt-1 border-t border-purple-500/20 flex justify-between items-center text-[9px] font-mono text-purple-400">
                  <span>Observation Node Check</span>
                  <span>Coherent OK</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-800/60 rounded-2xl rounded-tl-none p-3.5 border border-slate-700/30 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
                計算中 (Synthesizing Coherence Path)
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Options Panel (Quick Action Buttons) */}
      <div className="px-4 py-2 bg-slate-950/30 border-t border-slate-800/80 flex flex-wrap gap-1.5">
        <button
          onClick={onRequestHint}
          disabled={isThinking || gameCompleted}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 hover:border-purple-400 text-[11px] font-sans text-purple-300 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          吾輩に解法ヒントを求めるニャ！
        </button>
        <button
          onClick={() => onSendMessage("このレベルの量子力学的な意味は？")}
          disabled={isThinking || gameCompleted}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-sans text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
        >
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
          このレベルの概念解説
        </button>
      </div>

      {/* Chat Input form */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isThinking || gameCompleted}
          placeholder={gameCompleted ? "コヒーレンス光路が開通しました。" : `エルヴィン博士に質問するニャ... (例: 「逆もつれって何？」)`}
          className="flex-1 min-w-0 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isThinking || gameCompleted}
          className="h-8.5 w-8.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center p-0 disabled:opacity-30 disabled:hover:bg-cyan-600 transition-all active:scale-95"
          id="send-chat-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
