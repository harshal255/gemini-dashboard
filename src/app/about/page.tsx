'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Brain, Info, ShieldCheck, Clock, Gauge, Sun, Moon } from 'lucide-react';

export default function AboutUs() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('gemini_tester_theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('gemini_tester_theme', nextTheme);
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main relative font-sans flex flex-col items-center">
      {/* Mesh Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-20%,var(--active-model-border)_0%,rgba(0,0,0,0)_80%)]" />

      {/* Navigation Header */}
      <header className="w-full max-w-[1000px] h-20 px-6 md:px-8 flex items-center justify-between border-b border-border-sidebar z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs md:text-sm font-semibold text-text-muted hover:text-text-main transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Playground
        </Link>
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-text-muted hover:text-text-main rounded-md hover:bg-bg-card transition-all"
            title="Toggle Theme Mode"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="flex items-center gap-2">
            <Info size={16} className="text-primary-accent" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-text-muted">About the App</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1000px] px-6 md:px-8 py-12 flex-1 flex flex-col z-10 space-y-10">
        
        {/* Title Block */}
        <section className="text-center md:text-left space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main tracking-tight uppercase leading-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-primary-accent-hover">Us</span>
          </h1>
          <p className="text-xs md:text-sm text-text-muted max-w-[650px] leading-relaxed">
            Welcome to Gemini API Checker — a developer-first tool built to inspect, validate, and benchmark Google Gemini API keys securely in the browser.
          </p>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs md:text-sm">
          
          <div className="bg-bg-card border border-border-card rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary-accent-light flex items-center justify-center">
              <ShieldCheck size={18} className="text-primary-accent" />
            </div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Secure & Client-Side</h3>
            <p className="text-text-muted leading-relaxed">
              We care about API security. When you check your key, the connection goes directly to Google AI Studio endpoints. No middleware server logs or intercepts your requests, protecting your billing credentials.
            </p>
          </div>

          <div className="bg-bg-card border border-border-card rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary-accent-light flex items-center justify-center">
              <Gauge size={18} className="text-primary-accent" />
            </div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Interactive Playground</h3>
            <p className="text-text-muted leading-relaxed">
              Instantly test model chat loops, input contexts, output token bounds, and send multimodal files (images, documents, code scripts) directly to see raw responses.
            </p>
          </div>

          <div className="bg-bg-card border border-border-card rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary-accent-light flex items-center justify-center">
              <Clock size={18} className="text-primary-accent" />
            </div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Performance Metrics</h3>
            <p className="text-text-muted leading-relaxed">
              Check real-time network latency, prompt token consumption, model candidate outputs, and session query counts automatically to inspect API tier performances.
            </p>
          </div>

          <div className="bg-bg-card border border-border-card rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary-accent-light flex items-center justify-center">
              <Brain size={18} className="text-primary-accent" />
            </div>
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Models Catalog</h3>
            <p className="text-text-muted leading-relaxed">
              Instantly fetch and browse the available Gemini models associated with your API key, search the list with debounced filtering, and view specifications easily.
            </p>
          </div>

        </section>

        {/* Mission Statement */}
        <section className="bg-primary-accent-light border border-primary-accent/20 rounded-xl p-6 space-y-3">
          <h3 className="text-xs md:text-sm font-bold text-text-main uppercase tracking-wider">Our Mission</h3>
          <p className="text-[11px] md:text-xs text-text-muted leading-relaxed">
            Gemini API Checker was founded to solve a common developer bottleneck: verifying if an API key is active, has the correct tier access, or is hitting request quotas. By eliminating server overhead and visual clutter, we provide an immediate debugging playground.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1000px] h-20 border-t border-border-sidebar flex items-center justify-between px-6 md:px-8 text-[11px] text-text-muted z-10 mt-12">
        <span>&copy; {new Date().getFullYear()} Gemini API Checker. 100% Client-Side Privacy.</span>
        <span>Secure & Serverless</span>
      </footer>
    </div>
  );
}
