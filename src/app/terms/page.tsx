'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Scale, ShieldCheck, Mail, Sun, Moon } from 'lucide-react';

export default function TermsOfService() {
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
            <Scale size={16} className="text-primary-accent" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-text-muted">Legal Terms</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1000px] px-6 md:px-8 py-12 flex-1 flex flex-col z-10 space-y-10">
        
        {/* Title Block */}
        <section className="text-center md:text-left space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main tracking-tight uppercase leading-tight">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-primary-accent-hover">Service</span>
          </h1>
          <p className="text-xs md:text-sm text-text-muted max-w-[650px] leading-relaxed">
            Last Updated: June 11, 2026. Please read these Terms of Service carefully before utilizing our validation playground.
          </p>
        </section>

        {/* Terms Sections */}
        <section className="space-y-8 text-xs md:text-sm text-text-muted leading-relaxed font-sans">
          
          <div className="space-y-2.5">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using the <strong>Gemini API Checker</strong> website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you are prohibited from using this tool.
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider">
              2. Description of Service
            </h2>
            <p>
              Gemini API Checker is a serverless, browser-based playground utility designed to validate Google Gemini API key connectivity, list model catalogs, measure latency, track prompt tokens, and estimate session rate-limits. This is a non-commercial debugging utility tool.
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider">
              3. API Key Security & Billing Disclaimer
            </h2>
            <p>
              Your security is paramount. Your API key remains strictly inside your browser local storage and memory. All model queries are sent directly to Google's official API servers.
            </p>
            <p className="text-amber-500 font-semibold dark:text-amber-400">
              ⚠️ Important Note on Billing: You are solely responsible for all generative requests, file uploads, token expenses, and billing charges incurred on your Google Cloud Console / Google AI Studio account through keys tested or used within this application.
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider">
              4. Disclaimer of Warranty
            </h2>
            <p>
              This website is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not guarantee that the API quotas, rate-limit approximations, or latency calculations correspond exactly to real-time Google billing metrics. 
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider">
              5. Limitation of Liability
            </h2>
            <p>
              In no event shall the developers, contributors, or site owners of Gemini API Checker be liable for any damages, key leakage, Google account suspensions, quota exhaustion, or financial losses resulting from the use or inability to use this web service.
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider">
              6. Terms Modification
            </h2>
            <p>
              We reserve the right to revise these terms at any time without prior notice. By using this website, you agree to be bound by the current version of these Terms of Service.
            </p>
          </div>

          <div className="space-y-2.5 border-t border-border-sidebar pt-6">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
              <Mail size={14} className="text-primary-accent" />
              Contact Information
            </h2>
            <p>
              For legal inquiries, developer feedback, or code requests, please reach out to us directly at: 
              <a href="mailto:harshalskahar389@gmail.com" className="text-primary-accent hover:underline ml-1 font-semibold">
                harshalskahar389@gmail.com
              </a>.
            </p>
          </div>

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
