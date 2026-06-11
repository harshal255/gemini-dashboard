'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { usePlayground } from '../context/PlaygroundContext';

export default function WarningModal() {
  const { warningModalMessage, setWarningModalMessage } = usePlayground();

  if (!warningModalMessage) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      onClick={() => setWarningModalMessage(null)}
    >
      <div 
        className="bg-bg-sidebar border border-[#ef4444]/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_24px_rgba(239,68,68,0.15)] flex flex-col animate-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-4 border-b border-border-sidebar flex items-center justify-between bg-bg-chat-header/35">
          <div className="flex items-center gap-2 text-[#ef4444]">
            <AlertTriangle size={15} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Required Action</h3>
          </div>
          <button 
            type="button"
            onClick={() => setWarningModalMessage(null)} 
            className="p-1.5 text-text-muted hover:text-text-main rounded-md hover:bg-bg-card transition-all cursor-pointer"
            aria-label="Close Warning"
          >
            <X size={14} />
          </button>
        </div>

        {/* Warning Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-3.5 bg-[#ef4444]/10 rounded-full text-[#ef4444] border border-[#ef4444]/15 animate-pulse">
            <AlertTriangle size={24} />
          </div>
          <p className="text-xs text-text-main font-medium leading-relaxed">
            {warningModalMessage}
          </p>
        </div>

        {/* CTA Footer */}
        <div className="p-4 border-t border-border-sidebar flex justify-center bg-bg-card/10">
          <button
            type="button"
            onClick={() => setWarningModalMessage(null)}
            className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-[#ef4444]/80 to-[#f97316]/80 hover:from-[#ef4444] hover:to-[#f97316] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-[#ef4444]/15"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
