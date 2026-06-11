'use client';

import React from 'react';
import { X, Brain, Sparkles, Key, AlertCircle } from 'lucide-react';
import { usePlayground } from '../context/PlaygroundContext';

export default function RightSidebar() {
  const {
    isRightSidebarOpen,
    setIsRightSidebarOpen,
    activeModelDetails,
    latency,
    requestCount,
    tokenUsage
  } = usePlayground();

  return (
    <section className={`
      fixed inset-y-0 right-0 z-30 w-[320px] bg-bg-sidebar border-l border-border-sidebar p-5 flex flex-col h-full overflow-y-auto transition-transform duration-200 ease-in-out backdrop-blur-md
      lg:static lg:translate-x-0
      ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="flex items-center justify-between mb-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] pb-2">
        <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-text-muted">Inspector Dashboard</span>
        <button 
          type="button"
          className="lg:hidden p-1.5 text-text-muted hover:text-text-main rounded-md hover:bg-bg-card cursor-pointer" 
          onClick={() => setIsRightSidebarOpen(false)}
        >
          <X size={16} />
        </button>
      </div>

      {/* Model info card */}
      <div className="bg-bg-card border border-border-card rounded-xl p-4 mb-4 shadow-sm">
        <h3 className="text-xs font-bold text-text-main mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Brain size={12} className="text-primary-accent" />
          Model Specifications
        </h3>
        <div className="flex justify-between text-xs mb-3">
          <span className="text-text-muted font-medium">Input Context Limit</span>
          <span className="font-semibold text-text-main">
            {activeModelDetails.inputTokenLimit ? `${(activeModelDetails.inputTokenLimit / 1000).toFixed(0)}k tokens` : '1.04M tokens'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-muted font-medium">Output Token Limit</span>
          <span className="font-semibold text-text-main">
            {activeModelDetails.outputTokenLimit ? `${(activeModelDetails.outputTokenLimit / 1000).toFixed(0)}k tokens` : '8k tokens'}
          </span>
        </div>
      </div>

      {/* Performance metrics card */}
      <div className="bg-bg-card border border-border-card rounded-xl p-4 mb-4 shadow-sm">
        <h3 className="text-xs font-bold text-text-main mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Sparkles size={12} className="text-success-accent" />
          Query Performance
        </h3>
        <div className="flex justify-between text-xs mb-3">
          <span className="text-text-muted font-medium">Latency (roundtrip)</span>
          <span className="font-semibold text-text-main">
            {latency ? `${latency.toFixed(2)}s` : '—'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-muted font-medium">Total Requests (Session)</span>
          <span className="font-semibold text-text-main">{requestCount}</span>
        </div>
      </div>

      {/* Token metrics card */}
      <div className="bg-bg-card border border-border-card rounded-xl p-4 mb-4 shadow-sm">
        <h3 className="text-xs font-bold text-text-main mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Key size={12} className="text-[#f59e0b]" />
          Token Usage Inspector
        </h3>
        <div className="flex justify-between text-xs mb-3">
          <span className="text-text-muted font-medium">Prompt Tokens</span>
          <span className="font-semibold text-text-main">{tokenUsage ? tokenUsage.prompt : '—'}</span>
        </div>
        <div className="flex justify-between text-xs mb-3">
          <span className="text-text-muted font-medium">Candidate Tokens</span>
          <span className="font-semibold text-text-main">{tokenUsage ? tokenUsage.candidates : '—'}</span>
        </div>
        <div className="flex justify-between text-xs border-t border-border-sidebar/55 pt-3 mt-3">
          <span className="font-semibold text-text-main">Total Tokens</span>
          <span className="font-bold text-primary-accent text-sm">
            {tokenUsage ? tokenUsage.total : '—'}
          </span>
        </div>
        {tokenUsage && (
          <div className="flex flex-col gap-1.5 border-t border-border-sidebar/55 pt-3 mt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted font-medium">Est. Cost (USD)</span>
              <span className="font-bold text-success-accent">
                ${((tokenUsage.prompt * (activeModelDetails.name.includes('pro') ? (1.25 / 1000000) : (0.075 / 1000000))) + 
                  (tokenUsage.candidates * (activeModelDetails.name.includes('pro') ? (5.00 / 1000000) : (0.30 / 1000000)))).toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted font-medium">Est. Cost (INR)</span>
              <span className="font-bold text-primary-accent">
                ₹{(((tokenUsage.prompt * (activeModelDetails.name.includes('pro') ? (1.25 / 1000000) : (0.075 / 1000000))) + 
                  (tokenUsage.candidates * (activeModelDetails.name.includes('pro') ? (5.00 / 1000000) : (0.30 / 1000000)))) * 95.4).toFixed(4)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Gemini Quota Estimator & Rate Limits */}
      <div className="bg-bg-card border border-border-card rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-bold text-text-main mb-4 flex items-center gap-2 uppercase tracking-wide">
          <AlertCircle size={12} className="text-red-400" />
          Gemini Quota Estimator
        </h3>
        <div className="flex justify-between text-xs mb-3">
          <span className="text-text-muted font-medium">Rate Limit (RPM)</span>
          <span className="font-semibold text-text-main">15 req/min</span>
        </div>
        <div className="flex justify-between text-xs mb-3">
          <span className="text-text-muted font-medium">Daily Limit (RPD)</span>
          <span className="font-semibold text-text-main">1,500 req/day</span>
        </div>
        <div className="flex justify-between text-xs border-t border-border-sidebar/55 pt-3 mt-3 mb-3">
          <span className="text-text-muted font-medium">Est. Session Usage</span>
          <span className="font-semibold text-text-main">{requestCount} / 1,500</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-muted font-semibold">Est. Remaining (Free)</span>
          <span className="font-bold text-success-accent text-sm">
            {Math.max(0, 1500 - requestCount)} left
          </span>
        </div>
        <div className="text-[10px] text-text-muted/70 mt-4 leading-normal font-mono space-y-1 border-t border-border-sidebar/30 pt-3">
          <p>*Estimates are based on Google's default free-tier rate limits. Google API does not return remaining quota details in response headers.</p>
          <p className="text-[#f59e0b]/80 pt-1.5">
            ⚠️ Note: This tracker is browser-specific. If this API key is used outside of this browser session (e.g. in other apps/tabs), those external requests cannot be tracked or calculated here.
          </p>
        </div>
      </div>
    </section>
  );
}
