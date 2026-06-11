'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { usePlayground } from '../context/PlaygroundContext';

export default function ModelSearchModal() {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    models,
    activeModel,
    setActiveModel
  } = usePlayground();

  const [catalogSearch, setCatalogSearch] = useState('');
  const [debouncedCatalogSearch, setDebouncedCatalogSearch] = useState('');

  // Debounce catalog search locally
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCatalogSearch(catalogSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [catalogSearch]);

  // Reset search input on close
  const handleClose = () => {
    setIsSearchModalOpen(false);
    setCatalogSearch('');
  };

  if (!isSearchModalOpen) return null;

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(debouncedCatalogSearch.toLowerCase()) || 
    m.description.toLowerCase().includes(debouncedCatalogSearch.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-bg-sidebar border border-border-sidebar rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200 cursor-default">
        {/* Modal Header */}
        <div className="p-4 border-b border-border-sidebar flex items-center justify-between bg-bg-chat-header/50">
          <div className="flex items-center gap-2">
            <Search size={15} className="text-primary-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-main">Search Models Catalog</h3>
          </div>
          <button 
            type="button"
            onClick={handleClose} 
            className="p-1.5 text-text-muted hover:text-text-main rounded-md hover:bg-bg-card transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-4 border-b border-border-sidebar bg-bg-card/20">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter models (e.g. gemini-2.5-flash)..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full pl-9 pr-14 py-2.5 text-xs bg-bg-input border border-border-input rounded-xl text-text-main outline-none focus:border-primary-accent transition-all font-mono"
              autoFocus
            />
            <Search className="absolute left-3 top-3.5 text-text-muted/70" size={13} />
            {catalogSearch && (
              <button
                type="button"
                onClick={() => setCatalogSearch('')}
                className="absolute right-3 top-2.5 text-[10px] text-text-muted hover:text-text-main font-semibold uppercase tracking-wider bg-bg-card/80 px-1.5 py-0.5 rounded border border-border-card cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="text-[10px] text-text-muted mt-2 font-mono flex justify-between px-1">
            <span>Debounced search (300ms)</span>
            {catalogSearch !== debouncedCatalogSearch && (
              <span className="text-primary-accent animate-pulse font-semibold">Typing...</span>
            )}
          </div>
        </div>

        {/* Filtered Models List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[50vh] no-scrollbar">
          {models.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs font-mono">
              No models loaded. Please enter a valid API key first.
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-xs font-mono">
              No models match "{debouncedCatalogSearch}"
            </div>
          ) : (
            filteredModels
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
                    handleClose();
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${activeModel === m.name
                    ? 'bg-primary-accent-light border-primary-accent text-primary-accent dark:text-primary-accent-hover font-bold shadow-[0_0_8px_var(--primary-accent-light)]'
                    : 'bg-bg-card/20 border-border-card hover:bg-bg-card/80 hover:border-border-card/80 text-text-muted hover:text-text-main'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold font-mono text-text-main">{m.name}</span>
                    <span className="text-[9px] font-mono uppercase bg-bg-card px-1.5 py-0.5 rounded border border-border-card text-text-muted">v{m.version}</span>
                  </div>
                  {m.description && (
                    <p className="text-[10px] text-text-muted/80 mt-1 leading-relaxed">{m.description}</p>
                  )}
                  <div className="text-[9px] text-text-muted flex gap-3 mt-2 font-mono">
                    <span>In: {m.inputTokenLimit ? `${(m.inputTokenLimit / 1000).toFixed(0)}k` : '1m'}</span>
                    <span>Out: {m.outputTokenLimit ? `${(m.outputTokenLimit / 1000).toFixed(0)}k` : '8k'}</span>
                  </div>
                </button>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
