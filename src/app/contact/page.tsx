'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mail, MessageSquare, Sun, Moon, Copy, Check } from 'lucide-react';

export default function ContactUs() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState(false);

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

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('harshalskahar389@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main relative font-sans flex flex-col items-center justify-between">
      {/* Mesh Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-20%,var(--active-model-border)_0%,rgba(0,0,0,0)_80%)]" />

      {/* Navigation Header */}
      <header className="w-full max-w-[1000px] h-20 px-6 md:px-8 flex items-center justify-between border-b border-border-sidebar z-10 shrink-0">
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
            <Mail size={16} className="text-primary-accent" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-text-muted">Contact Support</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[600px] px-6 py-12 flex-1 flex flex-col justify-center items-center z-10">
        <div className="w-full bg-bg-card border border-border-card rounded-3xl p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden group">
          {/* Decorative gradients */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-accent/10 rounded-full blur-3xl group-hover:bg-primary-accent/15 transition-all duration-700 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-accent/5 rounded-full blur-3xl pointer-events-none" />

          {/* Heading */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-accent-light flex items-center justify-center mx-auto text-primary-accent mb-2">
              <Mail size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-text-main tracking-tight uppercase">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-primary-accent-hover">Touch</span>
            </h1>
            <p className="text-xs md:text-sm text-text-muted leading-relaxed max-w-[400px] mx-auto">
              Have questions about key safety, API issues, rate limit calculations, or business inquiries? Drop us a message directly.
            </p>
          </div>

          {/* Direct Email Card */}
          <div className="bg-bg-input border border-border-sidebar rounded-2xl px-5 py-6 sm:p-8 text-center space-y-4 max-w-[440px] mx-auto w-full">
            <span className="font-bold text-text-muted uppercase text-[10px] tracking-widest block">Support Email</span>
            
            <div className="flex items-center justify-center gap-2">
              <a 
                href="mailto:harshalskahar389@gmail.com" 
                className="text-[13px] min-[375px]:text-sm sm:text-lg md:text-xl font-extrabold text-text-main hover:text-primary-accent hover:underline decoration-primary-accent/40 decoration-2 underline-offset-4 transition-all duration-300 select-all whitespace-nowrap"
                title="Click to Email"
              >
                harshalskahar389@gmail.com
              </a>
              <button
                type="button"
                onClick={copyEmailToClipboard}
                className="p-1.5 hover:bg-bg-sidebar border border-transparent hover:border-border-sidebar rounded-lg text-text-muted hover:text-primary-accent transition-all cursor-pointer shrink-0"
                title="Copy Email Address"
              >
                {copied ? <Check size={14} className="text-success-accent" /> : <Copy size={14} />}
              </button>
            </div>

            {copied && (
              <span className="text-[10px] font-bold text-success-accent block uppercase tracking-wider">
                Copied to clipboard!
              </span>
            )}
          </div>

          {/* Bottom Info Banner */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted text-center pt-2 border-t border-border-sidebar/40">
            <MessageSquare size={12} className="text-primary-accent" />
            <span>Response Speed: Typically responds within 24-48 business hours.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1000px] h-20 border-t border-border-sidebar flex items-center justify-between px-6 md:px-8 text-[11px] text-text-muted z-10 shrink-0">
        <span>&copy; {new Date().getFullYear()} Gemini API Checker. 100% Client-Side Privacy.</span>
        <span>Secure & Serverless</span>
      </footer>
    </div>
  );
}
