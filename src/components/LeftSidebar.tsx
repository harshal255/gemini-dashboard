'use client';

import React from 'react';
import Link from 'next/link';
import { X, RefreshCw, Search, Loader2, AlertCircle, Info } from 'lucide-react';
import { usePlayground } from '../context/PlaygroundContext';

export default function LeftSidebar() {
  const {
    apiKey,
    setApiKey,
    models,
    isLoadingModels,
    modelError,
    activeModel,
    setActiveModel,
    isLeftSidebarOpen,
    setIsLeftSidebarOpen,
    setIsSearchModalOpen,
    fetchModels,
  } = usePlayground();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-[280px] bg-bg-sidebar border-r border-border-sidebar flex flex-col h-full transition-transform duration-200 ease-in-out backdrop-blur-md
      lg:static lg:translate-x-0
      ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-5 border-b border-border-sidebar flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-bg-card border border-border-card shadow-[0_0_12px_var(--primary-accent-light)]">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase">Gemini API Checker</h1>
            <span className="text-[10px] text-text-muted font-mono block">Playground & Inspector</span>
          </div>
        </div>
        <button 
          type="button"
          className="lg:hidden p-1.5 text-text-muted hover:text-text-main rounded-md hover:bg-bg-card" 
          onClick={() => setIsLeftSidebarOpen(false)}
        >
          <X size={16} />
        </button>
      </div>

      {/* API Settings */}
      <section className="p-5 border-b border-border-sidebar">
        <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-text-muted block mb-3">API Settings</span>
        <div className="relative mb-2">
          <input
            type="password"
            placeholder="Gemini API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-bg-input border border-border-input rounded-lg text-text-main outline-none focus:border-primary-accent focus:bg-bg-card transition-all"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => fetchModels()}
            disabled={isLoadingModels}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border-sidebar hover:bg-bg-card rounded-lg text-[11px] text-text-main disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <RefreshCw size={11} className={isLoadingModels ? 'animate-spin' : ''} />
            Reload List
          </button>
          {apiKey && (
            <button
              type="button"
              onClick={() => setApiKey('')}
              className="px-2 py-1.5 border border-border-sidebar hover:bg-[#ef4444]/10 rounded-lg text-[11px] text-[#ef4444] transition-all cursor-pointer"
              title="Clear Key"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Models list */}
      <section className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-text-muted">Models Catalog</span>
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="p-1 hover:bg-bg-card rounded text-text-muted hover:text-text-main transition-all flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold border border-border-sidebar/30 bg-bg-card/10 cursor-pointer"
            title="Search Catalog"
          >
            <Search size={10} className="text-primary-accent" />
            <span>Search</span>
          </button>
        </div>
        {isLoadingModels ? (
          <div className="flex flex-col gap-2 py-8 items-center justify-center">
            <Loader2 className="animate-spin text-primary-accent" size={20} />
            <span className="text-[11px] text-text-muted">Syncing available catalog...</span>
          </div>
        ) : modelError ? (
          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-[11px] text-red-400">
            <AlertCircle size={12} className="inline mr-1.5 align-text-bottom" />
            {modelError}
          </div>
        ) : (
          [...models]
            .sort((a, b) => {
              if (a.name === activeModel) return -1;
              if (b.name === activeModel) return 1;
              return 0;
            })
            .map(m => (
              <button
                key={m.name}
                type="button"
                onClick={() => {
                  setActiveModel(m.name);
                  setIsLeftSidebarOpen(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${activeModel === m.name
                    ? 'bg-primary-accent-light border-primary-accent text-primary-accent dark:text-primary-accent-hover font-bold shadow-[0_0_8px_var(--primary-accent-light)]'
                    : 'bg-bg-card/20 border-border-card hover:bg-bg-card/80 hover:border-border-card/80 text-text-muted hover:text-text-main'
                  }`}
              >
                <div className="text-xs font-semibold">{m.name}</div>
                <div className="text-[10px] text-text-muted flex gap-2.5 mt-1 font-mono">
                  <span>In: {m.inputTokenLimit ? `${(m.inputTokenLimit / 1000).toFixed(0)}k` : '1m'}</span>
                  <span>Out: {m.outputTokenLimit ? `${(m.outputTokenLimit / 1000).toFixed(0)}k` : '8k'}</span>
                </div>
              </button>
            ))
        )}
      </section>

      {/* Sidebar Footer links */}
      <div className="p-4 border-t border-border-sidebar flex flex-col gap-2.5 text-[11px] text-text-muted bg-bg-sidebar-footer">
        <div className="flex items-center justify-between w-full">
          <Link href="/faq" className="hover:text-text-main transition-all flex items-center gap-1.5 font-sans font-medium">
            <Info size={12} className="text-primary-accent" />
            Help & FAQ Guide
          </Link>
          <span className="text-[10px] font-mono">v1.0.0</span>
        </div>
        <div className="flex items-center gap-2 border-t border-border-sidebar/50 pt-2 text-[10px] font-sans flex-wrap">
          <Link href="/privacy" className="hover:text-text-main transition-all">Privacy</Link>
          <span className="text-gray-700">•</span>
          <Link href="/terms" className="hover:text-text-main transition-all">Terms</Link>
          <span className="text-gray-700">•</span>
          <Link href="/about" className="hover:text-text-main transition-all">About</Link>
          <span className="text-gray-700">•</span>
          <Link href="/contact" className="hover:text-text-main transition-all">Contact</Link>
        </div>
      </div>
    </aside>
  );
}
