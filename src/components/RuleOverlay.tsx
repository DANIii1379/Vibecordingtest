/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Zap, Key, RefreshCw, Sparkles, BookOpen, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RuleOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleOverlay: React.FC<RuleOverlayProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-cyan-400">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-base font-semibold font-sans">EntangLO 量子マニュアル</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300 leading-relaxed scrollbar-thin">
              {/* Core Concept */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <span className="w-1.5 h-3 bg-cyan-400 rounded-full" />
                  基本目的：コヒーレンス光の開通
                </h3>
                <p>
                  このパズルは「導波路（Waveguide）」と呼ばれる電磁グリッドを回し、
                  <strong>【光源 (Source)】</strong>から放たれる強力なレーザー（コヒーレンス光）を、回路の
                  <strong>【量子コア (Core)】</strong>に伝えるのが目的です。
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-[11px]">光源 (Source)</h4>
                      <p className="text-[10px] text-slate-400">エネルギーを放射する起点</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-[11px]">コア (Core)</h4>
                      <p className="text-[10px] text-slate-400">エネルギーの終点・開通口</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wire Rules */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <span className="w-1.5 h-3 bg-cyan-400 rounded-full" />
                  光を繋ぐ導波パターン
                </h3>
                <p>
                  各タイルをクリックすると、標準の<strong>時計回りに 90度</strong>回転します。
                  隣り合うタイル同士が互いにポートを向けていれば、エネルギー光が伝わって自動的に青く発光します！
                </p>
              </div>

              {/* Quantum Entanglement rules */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <span className="w-1.5 h-3 bg-purple-400 rounded-full" />
                  量子もつれ：非局所的な連動
                </h3>
                <p>
                  このゲーム最大の特徴は、回路内で発生している粒子たちの<strong>【量子もつれ (Quantum Entanglement)】</strong>です。
                  同一のギリシャ文字記号(α, β, Ψ, ω など)や、色が同じフレームになっているタイルはもつれ関係にあります。
                </p>

                <div className="space-y-3 mt-3">
                  <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-purple-400" />
                      <h4 className="font-semibold text-purple-300 text-[11px]">直接もつれ (Direct / +)</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      片方の導波路を時計回りに回すと、もつれた片方も<strong>同時に「時計回り」</strong>に回転します。一致した状態を維持したまま回ります。
                    </p>
                  </div>

                  <div className="p-3 bg-pink-950/20 border border-pink-500/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-rose-400 text-xs font-mono mr-1">±</span>
                      <h4 className="font-semibold text-pink-300 text-[11px]">逆相もつれ (Inverse / -)</h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      片方の導波路を時計回りに回すと、もつれたもう片方は<strong>自動的に「反時計回り」</strong>に回転します！
                      片方を回すともう片方の接続が壊れるため、逆もつれの関係性を読み解き、回す【順序】や【最終アライメント】を計算する最たるパズルですニャ。
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Coaching info */}
              <div className="space-y-1.5 p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-200">エルヴィン教授のコヒーレンス補助</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    右側のコントロールパネルから、吾輩エルヴィンに
                    <strong>【吾輩に解法ヒントを求めるニャ！】</strong>
                    と声を掛けてほしい。現在の盤面データを量子的にスキャンし、最善のアドバイスをリアルタイムに計算して差し上げよう。
                  </p>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs tracking-wide transition-all active:scale-95 shadow-md shadow-cyan-950/50"
              >
                波動関数の理解を完了 (閉じる)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
