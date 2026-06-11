'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ShieldCheck, Eye, Database, Lock, Sun, Moon } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <ShieldCheck size={16} className="text-primary-accent" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-text-muted">Compliance & Privacy</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1000px] px-6 md:px-8 py-12 flex-1 flex flex-col z-10 space-y-10">
        
        {/* Title Block */}
        <section className="text-center md:text-left space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main tracking-tight uppercase leading-tight">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-primary-accent-hover">Policy</span>
          </h1>
          <p className="text-xs md:text-sm text-text-muted max-w-[650px] leading-relaxed">
            Last Updated: June 11, 2026. Learn how we handle your data, our client-side storage model, and Google AdSense cookie compliance policies.
          </p>
        </section>

        {/* Highlight Banner */}
        <div className="bg-primary-accent-light border border-primary-accent/20 rounded-xl p-6 flex items-start gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="w-12 h-12 rounded-lg bg-primary-accent-light flex items-center justify-center shrink-0">
            <Lock size={20} className="text-primary-accent" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold text-text-main uppercase tracking-wider mb-1">100% Client-Side Privacy</h3>
            <p className="text-[11px] md:text-xs text-text-muted leading-relaxed">
              This application operates entirely in your web browser. Your Google Gemini API key is never uploaded to any backend database, third-party server, or log files controlled by us. All API requests go directly from your browser to Google AI Studio endpoints.
            </p>
          </div>
        </div>

        {/* Privacy Sections */}
        <section className="space-y-10 text-xs md:text-sm text-text-muted leading-relaxed font-sans">
          
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
              <Eye size={14} className="text-primary-accent font-bold" />
              1. Information We Collect
            </h2>
            <p>
              Because this application is a serverless frontend website, we do not require user account registration, login credentials, or personal profiles. We do not run databases to collect or harvest text prompts, attached files, or generated completions.
            </p>
            <p>
              Any information you enter—specifically your **Google Gemini API Key**, text messages, and file attachments—is processed only in memory or saved locally in your own browser's storage.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
              <Database size={14} className="text-primary-accent font-bold" />
              2. Browser Storage & Data Control
            </h2>
            <p>
              Your validated Gemini API Key, Request Counts, last Latency records, and Token Usage settings are saved locally inside your browser's <strong>localStorage</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-1">
              <li>This data remains strictly on your device and is never synchronized across devices.</li>
              <li>You can wipe out this data completely at any time by clicking the <strong>Clear Key</strong> button in the application sidebar, or by clearing your browser cache/cookies.</li>
            </ul>
          </div>

          {/* Section 3 (Crucial for AdSense) */}
          <div className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-success-accent font-bold" />
              3. Cookies and Advertising (Google AdSense)
            </h2>
            <p>
              We plan to serve advertisements on this website using **Google AdSense** to support free hosting and development. 
            </p>
            <p>
              Google, as a third-party vendor, uses cookies to serve ads on this site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to this site and other websites on the Internet.
            </p>
            <p>
              Users may choose to opt-out of personalized advertising by visiting Google's Ads Settings: 
              <a 
                href="https://www.google.com/settings/ads" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-accent hover:underline ml-1 font-semibold"
              >
                Google Ad Settings
              </a>.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={14} className="text-amber-400 font-bold" />
              4. Direct Google API Communication
            </h2>
            <p>
              When validating and testing keys, your web browser opens direct connections to Google's official domain: <code className="bg-bg-card border border-border-card px-1.5 py-0.5 rounded font-mono text-xs">generativelanguage.googleapis.com</code>.
            </p>
            <p>
              Your interactions with Gemini models are subject to Google's own Privacy Policy and Google AI Studio Terms of Service. Google may log requests sent to its free-tier endpoints to train its models. If you wish to opt-out of Google's data logging, you should use the paid/enterprise tier of the Gemini API.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider">
              5. Consent
            </h2>
            <p>
              By using our website, you hereby consent to our Privacy Policy and agree to its terms and conditions.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <h2 className="text-sm md:text-base font-bold text-text-main uppercase tracking-wider">
              6. Contact Us
            </h2>
            <p>
              If you have any questions or require more information about this Privacy Policy, please feel free to open an issue in our project repository.
            </p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1000px] py-6 border-t border-border-sidebar flex flex-col md:flex-row items-center justify-between px-6 md:px-8 text-[11px] text-text-muted z-10 mt-12 gap-4">
        <span>&copy; {new Date().getFullYear()} Gemini API Checker. 100% Client-Side Privacy.</span>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="hover:text-text-main transition-all">Privacy</Link>
          <span className="text-gray-700">•</span>
          <Link href="/terms" className="hover:text-text-main transition-all">Terms</Link>
          <span className="text-gray-700">•</span>
          <Link href="/about" className="hover:text-text-main transition-all">About</Link>
          <span className="text-gray-700">•</span>
          <Link href="/contact" className="hover:text-text-main transition-all">Contact</Link>
          <span className="text-gray-700">•</span>
          <Link href="/faq" className="hover:text-text-main transition-all">FAQ</Link>
        </div>
      </footer>
    </div>
  );
}
