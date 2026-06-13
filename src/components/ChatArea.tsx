'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Image as ImageIcon, FileText, Loader2, Sparkles, Trash2, Menu, Info, Sun, Moon, ChevronDown, Square, Copy, Check, History, Globe
} from 'lucide-react';
import { marked } from 'marked';
import { usePlayground, Attachment } from '../context/PlaygroundContext';

// CopyButton helper component with clipboard copy visual feedback
const CopyButton = ({ text, isUser = false }: { text: string; isUser?: boolean }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy text:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`p-1 rounded transition-all cursor-pointer flex items-center justify-center shrink-0 border ${
        isUser
          ? copied
            ? 'bg-white/20 border-white/30 text-white shadow-sm'
            : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/15 hover:text-white'
          : copied
            ? 'bg-success-bg border-success-accent text-success-accent shadow-sm'
            : 'bg-transparent border-border-input text-text-muted hover:text-text-main hover:border-primary-accent'
      }`}
      title="Copy to Clipboard"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
};

// Helper function to extract thinking process and actual response from model text
// Helper function to extract thinking process and actual response from model text
const splitThinkingAndResponse = (text: string): { thinking: string | null; response: string } => {
  if (!text) return { thinking: null, response: '' };

  // 1. Standard <think> tags (DeepSeek R1 style)
  if (text.includes('<think>')) {
    const parts = text.split('</think>');
    const thinkingPart = parts[0].replace('<think>', '').trim();
    const responsePart = parts.slice(1).join('</think>').trim();
    return {
      thinking: thinkingPart || null,
      response: responsePart || text
    };
  }

  // 2. "Drafting the response:" style (Gemini system prompt style)
  const draftingRegex = /([\s\S]*?)(?:Drafting\s+(?:the\s+)?response:\s*)"([\s\S]*?)"\s*$/i;
  const matchDrafting = text.match(draftingRegex);
  if (matchDrafting) {
    return {
      thinking: matchDrafting[1].trim() || null,
      response: matchDrafting[2].trim()
    };
  }

  // Alternate drafting match without quotes
  const draftingNoQuotesRegex = /([\s\S]*?)(?:Drafting\s+(?:the\s+)?response:\s*)([\s\S]*?)$/i;
  const matchDraftingNoQuotes = text.match(draftingNoQuotesRegex);
  if (matchDraftingNoQuotes) {
    const responseCandidate = matchDraftingNoQuotes[2].trim();
    if (responseCandidate.length > 0 && !responseCandidate.includes('\n\n')) {
      return {
        thinking: matchDraftingNoQuotes[1].trim() || null,
        response: responseCandidate
      };
    }
  }

  // 3. Multi-paragraph quoted response parser (handles responses with mixed thinking, bullets, and one or more quoted response paragraphs)
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    const quotedParagraphs: string[] = [];
    const thinkingParagraphs: string[] = [];

    for (const p of paragraphs) {
      if (p.startsWith('"') && p.endsWith('"') && p.length > 2) {
        quotedParagraphs.push(p.slice(1, -1).trim());
      } else {
        thinkingParagraphs.push(p);
      }
    }

    if (quotedParagraphs.length > 0 && thinkingParagraphs.length > 0) {
      const hasThinkingKeywords = thinkingParagraphs.some(p => 
        /user\s+(said|asked|responded)|draft|correction|goal|interpret|should:|thinking|acknowledge|search/i.test(p) ||
        p.startsWith('*') || p.startsWith('-') || /^\d+\./.test(p)
      );

      if (hasThinkingKeywords) {
        return {
          thinking: thinkingParagraphs.join('\n\n'),
          response: quotedParagraphs.join('\n\n')
        };
      }
    }
  }

  // 4. Last paragraph in quotes style (e.g., "Okay!...")
  if (paragraphs.length > 1) {
    const lastParagraph = paragraphs[paragraphs.length - 1];
    if (lastParagraph.startsWith('"') && lastParagraph.endsWith('"') && lastParagraph.length > 2) {
      const hasThinkingKeywords = paragraphs.slice(0, -1).some(p => 
        /user\s+(said|asked|responded)|draft|correction|goal|interpret|should:|thinking|acknowledge/i.test(p) ||
        p.startsWith('*') || p.startsWith('-') || /^\d+\./.test(p)
      );
      if (hasThinkingKeywords) {
        const thinking = paragraphs.slice(0, -1).join('\n\n');
        const response = lastParagraph.slice(1, -1).trim();
        return { thinking, response };
      }
    }
  }

  // 5. Fallback for "Reasoning-only" outputs containing quoted drafts in the last paragraph
  if (paragraphs.length > 0) {
    const lastParagraph = paragraphs[paragraphs.length - 1];
    const hasThinkingKeywords = paragraphs.some(p => 
      /user\s+(said|asked|responded)|draft|correction|goal|interpret|should:|thinking|acknowledge/i.test(p) ||
      p.startsWith('*') || p.startsWith('-') || /^\d+\./.test(p)
    );
    if (hasThinkingKeywords) {
      const quoteMatches = [...lastParagraph.matchAll(/"([^"]+)"/g)];
      if (quoteMatches.length > 0) {
        const response = quoteMatches[0][1].trim();
        return {
          thinking: text.trim(),
          response: response
        };
      }
    }
  }

  // 6. Alternative fallback: If the response has thinking keywords/bullets in the earlier paragraphs
  // but the very last paragraph is a normal response text (not in quotes), extract it as response.
  if (paragraphs.length > 1) {
    const lastParagraph = paragraphs[paragraphs.length - 1];
    const isLastParagraphBulletOrHeading = lastParagraph.startsWith('*') || lastParagraph.startsWith('-') || /^\d+\./.test(lastParagraph) || lastParagraph.startsWith('#');
    const earlierHasThinkingKeywords = paragraphs.slice(0, -1).some(p => 
      /user\s+(said|asked|responded)|draft|correction|goal|interpret|should:|thinking|acknowledge/i.test(p) ||
      p.startsWith('*') || p.startsWith('-') || /^\d+\./.test(p)
    );
    if (!isLastParagraphBulletOrHeading && earlierHasThinkingKeywords) {
      const isLastParagraphThinking = /should\s+try|need\s+to|search\s+first|i\s+should/i.test(lastParagraph) && lastParagraph.length < 150;
      if (!isLastParagraphThinking) {
        return {
          thinking: paragraphs.slice(0, -1).join('\n\n'),
          response: lastParagraph
        };
      }
    }
  }

  return { thinking: null, response: text };
};

export default function ChatArea() {
  const {
    activeModel,
    setActiveModel,
    models,
    theme,
    toggleTheme,
    messages,
    isSending,
    setIsLeftSidebarOpen,
    setIsRightSidebarOpen,
    handleSendMessage,
    clearChat,
    stopGeneration,
    isToonEnabled,
    setIsToonEnabled,
    isRememberEnabled,
    setIsRememberEnabled,
    isWebSearchEnabled,
    setIsWebSearchEnabled,
    activeModelDetails
  } = usePlayground();

  // Local state for dropdown, text inputs, attachments, drag status, and image preview
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  // Track expanded state of thinking accordion per message ID
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  const toggleThought = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Local React DOM Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close selection dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smooth scroll to bottom of chat logs
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Local File Upload Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: reader.result as string
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            textContent: reader.result as string
          }
        ]);
      };
      reader.readAsText(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index));
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = () => {
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            ...(isImage ? { dataUrl: reader.result as string } : { textContent: reader.result as string })
          }
        ]);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  // Clipboard Paste Handler (e.g. for copied screenshots / images)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let hasFile = false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (!file) continue;

        hasFile = true;
        const isImage = file.type.startsWith('image/');
        const reader = new FileReader();

        reader.onload = () => {
          setAttachments(prev => [
            ...prev,
            {
              name: file.name || `pasted-image-${Date.now()}.${isImage ? 'png' : 'txt'}`,
              type: file.type,
              size: file.size,
              ...(isImage ? { dataUrl: reader.result as string } : { textContent: reader.result as string })
            }
          ]);
        };

        if (isImage) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      }
    }

    if (hasFile) {
      e.preventDefault();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;

    const textToSend = inputText;
    const attachmentsToSend = [...attachments];

    // Clear inputs immediately so the user knows the message was sent
    setInputText('');
    setAttachments([]);

    // Trigger context API call
    await handleSendMessage(textToSend, attachmentsToSend);
  };

// Preprocess markdown to collapse multiple spaces after list bullets 
// and strip 4-space indentation outside code blocks to prevent unintended <pre> code rendering.
const preprocessMarkdown = (text: string): string => {
  if (!text) return '';
  
  const lines = text.split('\n');
  let inFencedCodeBlock = false;
  
  const processedLines = lines.map((line) => {
    if (line.trim().startsWith('```')) {
      inFencedCodeBlock = !inFencedCodeBlock;
      return line;
    }
    
    if (inFencedCodeBlock) {
      return line;
    }
    
    // 1. Collapse multiple spaces after list bullets (e.g. "*   Subject:" -> "* Subject:")
    let processedLine = line.replace(/^(\s*[*+-]|\s*\d+\.)[ \t]{2,}/, '$1 ');
    
    // 2. Avoid 4-space indentation triggering `<pre>` blocks if not inside a fenced block
    if (processedLine.startsWith('    ') || processedLine.startsWith('\t')) {
      const stripped = processedLine.trim();
      const isSubBullet = /^[*+-]|\d+\./.test(stripped);
      if (isSubBullet) {
        processedLine = '  ' + stripped;
      } else {
        processedLine = stripped;
      }
    }
    
    return processedLine;
  });
  
  return processedLines.join('\n');
};


  const parseMessageText = (text: string, role: 'user' | 'model') => {
    if (!text) return null;

    let processedText = text;


    // Preprocess markdown indentation to prevent regular text from being treated as code blocks
    processedText = preprocessMarkdown(processedText);

    try {
      let htmlContent = marked.parse(processedText, { async: false }) as string;
      // Force all links in parsed markdown to open in a new tab
      htmlContent = htmlContent.replace(/<a\s+href=/g, '<a target="_blank" rel="noopener noreferrer" href=');
      return (
        <div 
          className={`markdown-body ${role === 'user' ? 'markdown-user' : 'markdown-model'}`}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    } catch (err) {
      console.warn('Markdown parsing error:', err);
      return <span>{text}</span>;
    }
  };

  return (
    <main 
      className="flex-1 flex flex-col min-w-0 bg-bg-main/40 border-r border-border-sidebar h-full relative z-10"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div 
          className="absolute inset-4 bg-bg-main/95 backdrop-blur-md border-2 border-dashed border-primary-accent rounded-2xl flex flex-col items-center justify-center gap-3 z-50 pointer-events-none animate-in fade-in duration-200"
        >
          <div className="p-4 bg-primary-accent-light rounded-full text-primary-accent">
            <ImageIcon size={32} />
          </div>
          <p className="text-sm font-bold text-text-main">Drop your images or files here</p>
          <p className="text-xs text-text-muted">Supports images and text/code files</p>
        </div>
      )}

      {/* Chat Header */}
      <header className="h-16 px-3 sm:px-5 border-b border-border-sidebar flex items-center justify-between bg-bg-chat-header backdrop-blur-md shrink-0 relative z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            className="lg:hidden p-1.5 text-text-muted hover:text-text-main rounded-md hover:bg-bg-card shrink-0 cursor-pointer"
            onClick={() => setIsLeftSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider hidden sm:inline">Model:</span>
              {models.length > 0 ? (
                <div className="relative inline-block text-left" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="model-select-dropdown bg-bg-sidebar border border-border-sidebar rounded-lg text-[11px] font-bold text-text-main px-2 py-1.5 outline-none flex items-center justify-between gap-1.5 w-[110px] sm:w-[190px] hover:border-primary-accent transition-all shrink-0 select-none cursor-pointer"
                  >
                    <span className="truncate">{activeModel}</span>
                    <ChevronDown size={11} className={`transform transition-transform shrink-0 text-text-muted ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-1 z-50 w-56 max-h-60 overflow-y-auto bg-bg-sidebar border border-border-sidebar rounded-xl shadow-lg p-1.5 focus:outline-none animate-in fade-in duration-100 no-scrollbar">
                      {models.map(m => (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => {
                            setActiveModel(m.name);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all truncate block cursor-pointer ${activeModel === m.name
                            ? 'bg-primary-accent-light text-primary-accent dark:text-primary-accent-hover font-bold'
                            : 'text-text-muted hover:text-text-main hover:bg-bg-card'
                            }`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs font-bold text-text-main truncate">{activeModelDetails.name}</span>
              )}
            </div>
            <span className="text-[10px] text-text-muted hidden sm:inline max-w-[500px] lg:max-w-[700px] leading-relaxed mt-0.5 truncate">{activeModelDetails.description}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div 
            className={`status-badge px-1.5 py-1 sm:px-2 sm:py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 shrink-0 ${
              models.length > 0 ? 'bg-success-bg text-success-accent' : 'bg-red-500/10 text-red-400'
            }`}
            title={models.length > 0 ? 'Connected' : 'Disconnected'}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${models.length > 0 ? 'bg-success-accent' : 'bg-red-400'}`} />
            <span className="hidden sm:inline">{models.length > 0 ? 'Connected' : 'Disconnected'}</span>
          </div>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="p-1.5 text-text-muted hover:text-red-400 rounded-md hover:bg-bg-card transition-all cursor-pointer"
              title="Clear Chat History"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-text-muted hover:text-text-main rounded-md hover:bg-bg-card transition-all cursor-pointer"
            title="Toggle Theme Mode"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            type="button"
            className="lg:hidden p-1.5 text-text-muted hover:text-text-main rounded-md hover:bg-bg-card cursor-pointer"
            onClick={() => setIsRightSidebarOpen(true)}
          >
            <Info size={18} />
          </button>
        </div>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-[400px] mx-auto space-y-4">
            <Sparkles size={40} className="text-text-muted animate-pulse" />
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">Gemini Playground</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Enter your key, choose a reasoning model from the list, and write prompts or attach files to validate connectivity.
            </p>
          </div>
        ) : (
          messages.map(msg => {
            const isModel = msg.role === 'model';
            let thinkingContent: string | null = null;
            let responseContent = msg.text;

            if (isModel) {
              if (msg.thinking) {
                thinkingContent = msg.thinking;
                responseContent = msg.text;
              } else {
                const split = splitThinkingAndResponse(msg.text);
                thinkingContent = split.thinking;
                responseContent = split.response;
              }
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-[13px] leading-relaxed relative ${msg.role === 'user'
                  ? 'self-end bg-primary-accent text-white rounded-tr-none shadow-[0_4px_16px_var(--primary-accent-light)]'
                  : 'self-start bg-bg-chat-ai border border-border-chat-ai text-text-main rounded-tl-none'
                  }`}
              >
                {/* Collapsible Thinking/Reasoning block */}
                {isModel && thinkingContent && (
                  <div className="mb-3 border-l-2 border-primary-accent/40 pl-3 py-1 bg-bg-sidebar/30 dark:bg-bg-sidebar/20 rounded-r-lg text-xs shrink-0 select-none">
                    <button
                      type="button"
                      onClick={() => toggleThought(msg.id)}
                      className="flex items-center gap-1.5 font-semibold text-text-muted hover:text-primary-accent transition-colors cursor-pointer"
                    >
                      <Sparkles size={11} className="text-primary-accent animate-pulse" />
                      <span>{expandedThoughts[msg.id] ? 'Hide thinking process' : 'Show thinking process'}</span>
                      <ChevronDown size={11} className={`transform transition-transform ${expandedThoughts[msg.id] ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedThoughts[msg.id] && (
                      <div className="mt-2 text-[11px] text-text-muted leading-relaxed max-w-none">
                        {parseMessageText(thinkingContent, 'model')}
                      </div>
                    )}
                  </div>
                )}

                <div>{parseMessageText(responseContent, msg.role)}</div>

                {/* Google Search Grounding Metadata Sources */}
                {isModel && msg.groundingMetadata && (
                  <div className="mt-3 pt-2 border-t border-border-sidebar/10 space-y-2 text-[11px] select-none">
                    {msg.groundingMetadata.webSearchQueries && msg.groundingMetadata.webSearchQueries.length > 0 && (
                      <div className="flex items-center gap-1.5 text-text-muted font-medium flex-wrap">
                        <Globe size={11} className="text-primary-accent animate-pulse shrink-0" />
                        <span className="shrink-0">Searched:</span>
                        <div className="flex flex-wrap gap-1">
                          {msg.groundingMetadata.webSearchQueries.map((query: string, qIdx: number) => (
                            <span key={qIdx} className="bg-primary-accent-light/35 text-primary-accent px-1.5 py-0.5 rounded text-[10px] font-semibold border border-primary-accent/15 shrink-0">
                              "{query}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {msg.groundingMetadata.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-text-muted font-medium flex items-center gap-1.5">
                          <Globe size={11} className="text-success-accent animate-pulse shrink-0" />
                          <span>Sources:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.groundingMetadata.groundingChunks.map((chunk: any, cIdx: number) => {
                            const webSource = chunk.web;
                            if (!webSource) return null;
                            return (
                              <a
                                key={cIdx}
                                href={webSource.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 bg-bg-sidebar/55 hover:bg-bg-sidebar border border-border-sidebar hover:border-primary-accent px-2 py-1 rounded-lg text-text-main text-[10.5px] transition-all cursor-pointer shadow-sm hover:shadow shrink-0"
                                title={webSource.title || webSource.uri}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-success-accent animate-pulse shrink-0" />
                                <span className="max-w-[150px] sm:max-w-[200px] truncate font-semibold text-text-main">
                                  {webSource.title || webSource.uri}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* User message token details (Prompt info) & Copy option */}
              {msg.role === 'user' && (
                <div className="text-[9px] text-white/70 flex items-center justify-between mt-2.5 pt-1.5 border-t border-white/20 font-mono gap-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <span className="truncate flex items-center gap-1.5">
                    <span>
                      {msg.tokens && msg.tokens.prompt > 0 
                        ? `Input: ${msg.tokens.prompt.toLocaleString()} tokens` 
                        : 'Prompt Input'
                      }
                      {msg.cost && ` | $${msg.cost.usd} (₹${msg.cost.inr})`}
                    </span>
                    {msg.isToonEnabled && (
                      <span className="bg-white/25 text-white px-1 py-0.2 rounded text-[7.5px] font-bold tracking-wide uppercase select-none">TOON</span>
                    )}
                  </span>
                  <CopyButton text={msg.text} isUser />
                </div>
              )}

              {/* Model message token details (Response/Candidate info) & Copy option */}
              {msg.role === 'model' && (
                <div className="text-[9px] text-text-muted flex items-center justify-between mt-2.5 pt-1.5 border-t border-border-sidebar/20 font-mono gap-4">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>
                      {msg.latency !== undefined && `took ${msg.latency.toFixed(2)}s`}
                    </span>
                    {msg.tokens && (
                      <span className="flex items-center gap-1">
                        <span>
                          | {msg.tokens.prompt > 0 
                            ? `P: ${msg.tokens.prompt.toLocaleString()} | R: ${msg.tokens.candidates.toLocaleString()}`
                            : `Output: ${msg.tokens.candidates.toLocaleString()}`
                          } tokens
                        </span>
                        {msg.isToonEnabled && (
                          <span className="ml-1 bg-primary-accent/15 border border-primary-accent/25 text-primary-accent px-1.5 py-0.2 rounded text-[7.5px] font-bold tracking-wide uppercase select-none">TOON Input</span>
                        )}
                      </span>
                    )}
                    {msg.cost && (
                      <span className="text-primary-accent font-semibold">
                        | ${msg.cost.usd} (₹{msg.cost.inr})
                      </span>
                    )}
                  </div>
                  <CopyButton text={msg.text} />
                </div>
              )}

              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {msg.attachments.map((att, idx) => (
                    <div key={idx} className="flex flex-col">
                      {att.dataUrl ? (
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          onClick={() => setPreviewImageUrl(att.dataUrl || null)}
                          className="max-w-[120px] max-h-[120px] rounded-lg object-cover border border-border-sidebar mt-1 cursor-zoom-in hover:brightness-90 transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-bg-input border border-border-input text-[10px] text-text-muted">
                          <FileText size={10} />
                          <span>{att.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            );
          })
        )}
        {isSending && (
          <div className="self-start flex items-center gap-2.5 bg-bg-card border border-border-card px-4 py-3 rounded-2xl rounded-tl-none text-[13px] text-text-muted">
            <Loader2 className="animate-spin text-primary-accent" size={14} />
            <span>Gemini is thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Shelf & Form */}
      <div className="p-3 sm:p-5 border-t border-border-sidebar bg-bg-sidebar/30 backdrop-blur-md shrink-0">
        {attachments.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {attachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-input border border-border-input text-[11px] text-text-main">
                {att.dataUrl ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImageUrl(att.dataUrl || null)}
                    className="flex items-center gap-1.5 hover:text-primary-accent transition-all cursor-zoom-in font-medium"
                    title="Preview Image"
                  >
                    <ImageIcon size={11} />
                    <span className="max-w-[120px] truncate">{att.name}</span>
                  </button>
                ) : (
                  <>
                    <FileText size={11} />
                    <span className="max-w-[120px] truncate">{att.name}</span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="text-text-muted hover:text-red-400 cursor-pointer"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-2.5 bg-bg-input border border-border-input rounded-xl p-3 focus-within:border-primary-accent transition-all min-w-0 w-full">
          <input
            type="file"
            aria-label="Attach Images"
            accept="image/*"
            ref={imageInputRef}
            className="hidden"
            onChange={handleImageUpload}
            multiple
          />
          <input
            type="file"
            aria-label="Attach Documents"
            accept=".pdf,.txt,.json,.csv,.js,.ts,.py,.html,.css"
            ref={docInputRef}
            className="hidden"
            onChange={handleDocUpload}
          />

          {/* Textarea Input field spanning full width on its own row */}
          <div className="flex-1 min-w-0 w-full">
            <textarea
              placeholder="Ask Gemini anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              onPaste={handlePaste}
              className="w-full bg-transparent border-none outline-none resize-none text-[13px] text-text-main py-1 min-h-[40px] max-h-40 font-sans placeholder-gray-600 no-scrollbar"
            />
          </div>

          {/* Action Toolbar Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-sidebar/10 shrink-0">
            {/* Left Actions: Attachments & Toggles */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
              <button
                type="button"
                className="p-1.5 text-text-muted hover:text-text-main rounded-lg hover:bg-bg-card transition-all shrink-0 cursor-pointer"
                onClick={() => imageInputRef.current?.click()}
                title="Attach Images"
              >
                <ImageIcon size={15} />
              </button>
              <button
                type="button"
                className="p-1.5 text-text-muted hover:text-text-main rounded-lg hover:bg-bg-card transition-all shrink-0 cursor-pointer"
                onClick={() => docInputRef.current?.click()}
                title="Attach Documents"
              >
                <FileText size={15} />
              </button>

              <div className="h-4 w-[1px] bg-border-sidebar/30 mx-0.5 shrink-0" />

              {/* TOON Compression Toggle with Rich Tooltip Note */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={() => setIsToonEnabled(!isToonEnabled)}
                  className={`h-[26px] flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer select-none uppercase tracking-wider shrink-0 font-mono ${
                    isToonEnabled 
                      ? 'bg-primary-accent border-primary-accent text-white shadow-sm font-semibold'
                      : 'bg-transparent border-border-input text-text-muted hover:text-text-main hover:border-primary-accent'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${isToonEnabled ? 'bg-white animate-pulse' : 'bg-text-muted/65'}`} />
                  TOON
                </button>
                
                {/* TOON Hover Note Tooltip */}
                <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-[25px] mb-3 w-72 p-4 bg-bg-sidebar border border-border-sidebar rounded-xl shadow-2xl opacity-0 pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-all duration-200 z-[100] text-left font-sans text-xs select-none">
                  <div className="flex items-center gap-1.5 font-bold text-text-main mb-1.5 text-[10.5px] uppercase tracking-wider">
                    <Sparkles size={11} className="text-primary-accent animate-pulse" />
                    What is TOON Format?
                  </div>
                  <p className="text-text-muted text-[10.5px] leading-relaxed mb-2.5">
                    TOON is an optimized serialization format. It compresses flat/tabular JSON structures and instructs Gemini to write responses in TOON, saving <strong>30%–50%</strong> of tokens. Note: Teaching the model TOON requires a static system instruction overhead of <strong>~97 tokens</strong>.
                  </p>

                  <div className="bg-bg-input/40 border border-border-input/30 rounded-lg p-2.5 mb-2.5 text-[10px] space-y-1 text-text-muted">
                    <div className="font-semibold text-text-main text-[10.5px] mb-0.5">💡 Usage Guide:</div>
                    <div>✔️ <strong className="text-primary-accent">ON:</strong> For <strong>flat (flattened) JSON</strong>, tabular data, table prompts, or list generation where savings far exceed the ~97 token overhead.</div>
                    <div>❌ <strong className="text-text-main">OFF:</strong> For <strong>deeply nested JSON</strong> objects (which degrade TOON efficiency and consume more tokens) or simple plain text queries.</div>
                  </div>

                  <div className="pt-2.5 border-t border-border-sidebar/40 flex items-center justify-between text-[9px]">
                    <span className="text-text-muted font-medium">Status: <span className={isToonEnabled ? 'text-success-accent font-bold' : 'text-text-muted/80'}>{isToonEnabled ? 'ACTIVE (ON)' : 'INACTIVE (OFF)'}</span></span>
                    <span className="text-primary-accent font-semibold">Saves Token Quotas</span>
                  </div>
                  {/* Tooltip Arrow pointing down */}
                  <div className="absolute top-full left-[21px] w-2.5 h-2.5 bg-bg-sidebar border-r border-b border-border-sidebar rotate-45 -translate-y-[5px]" />
                </div>
              </div>

              {/* Remember Conversation Context Toggle */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={() => setIsRememberEnabled(!isRememberEnabled)}
                  className={`h-[26px] flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer select-none uppercase tracking-wider shrink-0 font-mono ${
                    isRememberEnabled 
                      ? 'bg-success-accent border-success-accent text-white shadow-sm font-semibold'
                      : 'bg-transparent border-border-input text-text-muted hover:text-text-main hover:border-success-accent'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${isRememberEnabled ? 'bg-white animate-pulse' : 'bg-text-muted/65'}`} />
                  Remember
                </button>
                
                {/* Remember Hover Note Tooltip */}
                <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-[60px] mb-3 w-64 p-3.5 bg-bg-sidebar border border-border-sidebar rounded-xl shadow-2xl opacity-0 pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-all duration-200 z-[100] text-left font-sans text-xs select-none">
                  <div className="flex items-center gap-1.5 font-bold text-text-main mb-1.5 text-[10.5px] uppercase tracking-wider">
                    <History size={11} className="text-success-accent animate-pulse" />
                    Conversation Context
                  </div>
                  <p className="text-text-muted text-[10.5px] leading-relaxed">
                    When enabled, Gemini remembers the previous chat history to keep context. When disabled, the history is ignored and each message is sent as a clean, single-turn request.
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-border-sidebar/40 flex items-center justify-between text-[9px]">
                    <span className="text-text-muted font-medium">Status: <span className={isRememberEnabled ? 'text-success-accent font-bold' : 'text-text-muted/80'}>{isRememberEnabled ? 'ON (Send Context)' : 'OFF (Single Turn)'}</span></span>
                    <span className="text-success-accent font-semibold">Contextual Chat</span>
                  </div>
                  {/* Tooltip Arrow pointing down */}
                  <div className="absolute top-full left-[60px] w-2.5 h-2.5 bg-bg-sidebar border-r border-b border-border-sidebar rotate-45 -translate-y-[5px]" />
                </div>
              </div>

              {/* Web Search Grounding Toggle */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={() => setIsWebSearchEnabled(!isWebSearchEnabled)}
                  className={`h-[26px] flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer select-none uppercase tracking-wider shrink-0 font-mono ${
                    isWebSearchEnabled 
                      ? 'bg-primary-accent border-primary-accent text-white shadow-sm font-semibold'
                      : 'bg-transparent border-border-input text-text-muted hover:text-text-main hover:border-primary-accent'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${isWebSearchEnabled ? 'bg-white animate-pulse' : 'bg-text-muted/65'}`} />
                  <Globe size={10} className="shrink-0" />
                  Web
                </button>
                
                {/* Web Search Hover Note Tooltip */}
                <div className="hidden sm:block absolute bottom-full left-1/2 -translate-x-[90px] mb-3 w-64 p-3.5 bg-bg-sidebar border border-border-sidebar rounded-xl shadow-2xl opacity-0 pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-all duration-200 z-[100] text-left font-sans text-xs select-none">
                  <div className="flex items-center gap-1.5 font-bold text-text-main mb-1.5 text-[10.5px] uppercase tracking-wider">
                    <Globe size={11} className="text-primary-accent animate-pulse" />
                    Google Search Grounding
                  </div>
                  <p className="text-text-muted text-[10.5px] leading-relaxed">
                    When enabled, Gemini uses Google Search to answer queries with live, real-time web results. Ideal for news, scores, and real-time facts. Note: Supported models only.
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-border-sidebar/40 flex items-center justify-between text-[9px]">
                    <span className="text-text-muted font-medium">Status: <span className={isWebSearchEnabled ? 'text-primary-accent font-bold' : 'text-text-muted/80'}>{isWebSearchEnabled ? 'ON (Live Search)' : 'OFF (Static knowledge)'}</span></span>
                    <span className="text-primary-accent font-semibold">Real-time Data</span>
                  </div>
                  {/* Tooltip Arrow pointing down */}
                  <div className="absolute top-full left-[90px] w-2.5 h-2.5 bg-bg-sidebar border-r border-b border-border-sidebar rotate-45 -translate-y-[5px]" />
                </div>
              </div>
            </div>

            {/* Right Action: Send/Stop Button */}
            <div className="shrink-0">
              {isSending ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shrink-0 cursor-pointer flex items-center justify-center animate-pulse"
                  title="Stop Generation"
                >
                  <Square size={12} fill="white" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="p-2 bg-primary-accent text-white rounded-lg hover:bg-primary-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer flex items-center justify-center"
                  disabled={!inputText.trim() && attachments.length === 0}
                >
                  <Send size={12} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      {/* Full-screen Image Preview Modal */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-200"
          onClick={() => setPreviewImageUrl(null)}
        >
          <button 
            type="button"
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-2.5 rounded-full transition-all cursor-pointer z-50"
            onClick={() => setPreviewImageUrl(null)}
            aria-label="Close Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          {/* Framed card wrapper to prevent landscape images from over-stretching */}
          <div 
            className="bg-bg-sidebar/95 border border-border-sidebar/40 rounded-2xl p-2 sm:p-4 max-w-[95vw] sm:max-w-4xl max-h-[85vh] flex items-center justify-center shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={previewImageUrl} 
              alt="Preview" 
              className="max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </main>
  );
}
