'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, HelpCircle, Search, ChevronRight, BookOpen, Shield, ShieldCheck, Cpu, Sun, Moon } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  // Category: Validation & Testing
  {
    category: "validation",
    q: "How to test if Gemini API is working?",
    a: "To test if your Gemini API is working, enter your API key in the validator input field of this dashboard. If valid, the system connects directly to Google's servers, retrieves the active models catalog, and shows a green 'Connected' badge. You can then write a test prompt in the chat playground to confirm the model returns responses."
  },
  {
    category: "validation",
    q: "How to check if API is valid or not?",
    a: "Our online tester automatically checks API validity by sending an authentic 'models.list' metadata request to Google's servers using the key you provided. If Google returns an HTTP 200 OK status code, the key is valid. If it returns an HTTP 400 or 403 status (e.g., API_KEY_INVALID), our UI highlights it as an invalid key instantly."
  },
  {
    category: "validation",
    q: "How do I check my Gemini validity?",
    a: "Enter your Google AI Studio key on this web application. The dashboard runs client-side checks and will display a confirmation banner showing the model metadata (input/output context token limits) if valid, or a detailed error stack if it fails."
  },
  {
    category: "validation",
    q: "How to test Gemini API key validity in Javascript?",
    a: "You can validate a key programmatically in JavaScript by sending a fetch request. Example:\n\n```javascript\nfetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + YOUR_API_KEY)\n  .then(res => {\n    if (res.ok) console.log('API key is valid!');\n    else console.error('Invalid key:', res.status);\n  });\n```"
  },
  {
    category: "validation",
    q: "Where can I find a Gemini API key validator on GitHub?",
    a: "This project is open-source! You can find similar client-side JavaScript / Next.js implementation scripts on GitHub by searching for 'gemini-api-key-tester' or 'gemini-dashboard'. All requests run locally in the client browser for ultimate privacy."
  },
  {
    category: "validation",
    q: "Test Gemini API key online without installing packages?",
    a: "Yes! This tool allows you to check your API key online immediately without installing `@google/generative-ai` packages or writing any Node.js/Python server code."
  },

  // Category: Free Tier & Pricing
  {
    category: "pricing",
    q: "Is the Google Gemini API free for testing?",
    a: "Yes, Google offers a highly generous Free Tier for developers testing the Gemini API. You do not need to link a credit card or pay for testing requests as long as you stay within the daily rate limits."
  },
  {
    category: "pricing",
    q: "How to use the Gemini API for free?",
    a: "You can use the Gemini API for free by signing up on Google AI Studio, creating a free API key, and using free-tier models such as Gemini 1.5 Flash or Gemini 1.5 Pro. These models cost $0 on the free tier."
  },
  {
    category: "pricing",
    q: "Does the Gemini API cost money?",
    a: "It depends on the plan you choose. The 'Free Tier' costs $0 but displays rate limit caps. Google also offers a 'Pay-as-you-go' tier which charges per token (roughly $0.075 per million input tokens on Flash) but removes request caps and allows commercial usage."
  },
  {
    category: "pricing",
    q: "What is the free limit for the Gemini API?",
    a: "Under the default free tier, you get up to 15 Requests per Minute (RPM), 1,500 Requests per Day (RPD), and a rate limit of 32,000 to 1,000,000 tokens per minute depending on the specific model."
  },
  {
    category: "pricing",
    q: "Is the Gemini API free forever?",
    a: "Google has committed to offering a free tier for developers to build prototypes, evaluate model features, and run hobby projects. Rate limits and model versions are subject to updates, but the free tier remains active."
  },
  {
    category: "pricing",
    q: "Which AI API is totally free for development?",
    a: "The Google Gemini API is currently the most popular AI API that provides a robust, totally free tier for developers. Other APIs (like OpenAI GPT-4 or Anthropic Claude) do not offer a free tier without prepaid credits."
  },

  // Category: Getting Started & Keys
  {
    category: "setup",
    q: "How to get a Gemini API key?",
    a: "1. Visit Google AI Studio (ai.google.dev).\n2. Sign in with your Google Workspace or Gmail account.\n3. Click the 'Get API Key' button in the top left.\n4. Click 'Create API Key', search/select your Google Cloud project, and copy the key."
  },
  {
    category: "setup",
    q: "Where is the Gemini API key generator?",
    a: "The official key generator is built inside the Google AI Studio console dashboard. Keys are generated instantly in under 10 seconds."
  },
  {
    category: "setup",
    q: "Is my API key safe on this online validator?",
    a: "Yes, 100% safe. We store your key only in your browser's private localStorage. The key is sent directly to Google's API endpoints (`generativelanguage.googleapis.com`) from your computer. No database or middleman server captures your keys or chats."
  },
  {
    category: "setup",
    q: "Can I use Gemini as an API inside my own chatbot app?",
    a: "Yes. Once you have validated your API key using this dashboard, you can integrate that same key into your Node.js, Python, Android, iOS, or web applications to serve users directly."
  },

  // Category: Comparison & Capabilities
  {
    category: "comparison",
    q: "Is Gemini as good as OpenAI GPT-4?",
    a: "Yes, Gemini models are highly competitive. Gemini 1.5 Pro features a massive 2-million-token context window (compared to GPT-4's 128k limit), allowing you to attach massive documents and hours of video. Flash models provide extremely fast response latency."
  },
  {
    category: "comparison",
    q: "Which API is best for AI application developers?",
    a: "Gemini is considered one of the best due to its zero-cost free testing tier, massive context limits, native multimodal processing (images, text, video, and audio), and seamless Google Cloud integration."
  },
  {
    category: "comparison",
    q: "What is the main purpose of an API?",
    a: "An Application Programming Interface (API) acts as a bridge that allows different software applications to talk to one another. The Gemini API allows your code to securely send prompts to Google's neural networks and receive intelligent AI completions in response."
  },
  {
    category: "comparison",
    q: "What models are available in the Gemini API catalog?",
    a: "The core active models are Gemini 1.5 Flash (optimized for fast reasoning and speed) and Gemini 1.5 Pro (optimized for complex reasoning and tasks). Older experimental models like Gemini 1.0 Pro are also accessible."
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
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

  // Filter FAQs based on search and category tab
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_ITEMS.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a.replace(/```[a-z]*\n|```/g, '') // remove code fence markers for clean schema output
      }
    }))
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main relative font-sans flex flex-col items-center">
      {/* JSON-LD FAQ Schema injection for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            <Sparkles size={16} className="text-primary-accent" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-text-muted">Gemini API Checker Guide</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[1000px] px-6 md:px-8 py-12 flex-1 flex flex-col z-10 space-y-10">
        
        {/* Title Block */}
        <section className="text-center md:text-left space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main tracking-tight uppercase leading-tight">
            Gemini API Key Testing & <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-primary-accent-hover">
              Validation FAQ Guide
            </span>
          </h1>
          <p className="text-xs md:text-sm text-text-muted max-w-[650px] leading-relaxed">
            Find answers to commonly asked questions regarding testing Gemini API keys online, tracking daily free limits, key safety, and JavaScript/Python validation scripts.
          </p>
        </section>

        {/* Search & Category Filter Section */}
        <section className="space-y-5">
          <div className="relative w-full bg-bg-input border border-border-input rounded-xl flex items-center px-4 focus-within:border-primary-accent transition-all">
            <Search size={16} className="text-text-muted/60 mr-3" />
            <input
              type="text"
              placeholder="Search questions or keywords (e.g. 'free tier', 'javascript', 'valid')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 text-xs md:text-sm bg-transparent border-none outline-none text-text-main placeholder-text-muted/50"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Questions', icon: <BookOpen size={11} /> },
              { id: 'validation', label: 'API Validation', icon: <ShieldCheck size={11} /> },
              { id: 'pricing', label: 'Limits & Free Tier', icon: <Cpu size={11} /> },
              { id: 'setup', label: 'Key Setup', icon: <Shield size={11} /> },
              { id: 'comparison', label: 'Capabilities', icon: <HelpCircle size={11} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                  setExpandedIndex(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all ${
                  activeCategory === tab.id
                    ? 'bg-primary-accent-light border-primary-accent/40 text-primary-accent dark:text-white shadow-[0_0_12px_var(--primary-accent-light)]'
                    : 'bg-bg-card border-border-card text-text-muted hover:text-text-main hover:border-border-card/60'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* FAQs List */}
        <section className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-bg-card border border-border-card rounded-xl overflow-hidden hover:border-border-card/80 transition-all duration-300 ${
                    isExpanded ? 'bg-bg-card border-border-card shadow-[0_4px_24px_rgba(0,0,0,0.15)]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    className="w-full flex items-center justify-between p-5 text-sm md:text-base font-bold text-text-main hover:bg-bg-card/30 transition-all text-left outline-none"
                  >
                    <span className="pr-4 tracking-tight leading-snug">{faq.q}</span>
                    <ChevronRight 
                      size={14} 
                      className={`text-text-muted shrink-0 transition-transform duration-300 ${
                        isExpanded ? 'rotate-90 text-primary-accent' : ''
                      }`} 
                    />
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[600px] border-t border-border-card p-6 bg-bg-main/30' : 'max-h-0'
                    }`}
                  >
                    <div className="text-[13px] md:text-sm text-text-muted leading-relaxed font-sans whitespace-pre-line space-y-3">
                      {faq.a.includes('```') ? (
                        faq.a.split('\n').map((line, lIdx) => {
                          if (line.startsWith('```')) return null;
                          return <div key={lIdx}>{line}</div>;
                        })
                      ) : (
                        faq.a
                      )}
                      {faq.q.includes('Javascript') && (
                        <pre className="bg-bg-main/60 border border-border-card rounded-lg p-4 my-2 overflow-x-auto text-[11px] md:text-xs font-mono leading-relaxed text-text-main">
                          <code>{`fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + YOUR_API_KEY)
  .then(res => {
    if (res.ok) console.log('API key is valid!');
    else console.error('Invalid key:', res.status);
  });`}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 border border-dashed border-border-card rounded-2xl">
              <HelpCircle size={32} className="text-text-muted/60 mx-auto mb-3 animate-bounce" />
              <div className="text-sm font-bold text-text-main">No FAQ items matched your search</div>
              <div className="text-xs text-text-muted mt-1">Try querying general words like 'limit', 'free', or 'key'.</div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1000px] py-6 border-t border-border-sidebar flex flex-col md:flex-row items-center justify-between px-6 md:px-8 text-[11px] text-text-muted z-10 mt-12 gap-4 font-sans">
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
