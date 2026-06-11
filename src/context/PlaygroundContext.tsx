'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { encode } from '@toon-format/toon';

export interface Attachment {
  name: string;
  type: string;
  size: number;
  dataUrl?: string; // For images
  textContent?: string; // For documents/text files
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachments?: Attachment[];
  timestamp: Date;
  latency?: number;
  tokens?: { prompt: number; candidates: number; total: number };
  cost?: { usd: string; inr: string };
  isToonEnabled?: boolean;
}

export interface ModelInfo {
  name: string;
  version: string;
  description: string;
  supportedGenerationMethods: string[];
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

// IndexedDB Helpers for chat history persistence (allows storing large images/files)
const DB_NAME = 'GeminiDashboardDB';
const DB_VERSION = 1;
const STORE_NAME = 'chat_history';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in browser'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

async function saveMessagesToDB(messages: ChatMessage[]) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const req = store.put({ id: 'history', messages });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save chat history to IndexedDB:', err);
  }
}

async function getMessagesFromDB(): Promise<ChatMessage[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.get('history');
      req.onsuccess = () => resolve(req.result?.messages || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load chat history from IndexedDB:', err);
    return [];
  }
}

async function clearMessagesFromDB() {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const req = store.delete('history');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to clear chat history from IndexedDB:', err);
  }
}

// Cookie Helpers
const getCookie = (name: string): string => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
};

interface PlaygroundContextProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  debouncedApiKey: string;
  models: ModelInfo[];
  isLoadingModels: boolean;
  modelError: string | null;
  activeModel: string;
  setActiveModel: (model: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isSending: boolean;
  latency: number | null;
  tokenUsage: { prompt: number; candidates: number; total: number } | null;
  requestCount: number;
  isLeftSidebarOpen: boolean;
  setIsLeftSidebarOpen: (open: boolean) => void;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: (open: boolean) => void;

  isToonEnabled: boolean;
  setIsToonEnabled: (enabled: boolean) => void;
  isRememberEnabled: boolean;
  setIsRememberEnabled: (enabled: boolean) => void;

  // Actions & Helpers
  fetchModels: (keyToUse?: string | object) => Promise<void>;
  handleSendMessage: (text: string, files: Attachment[]) => Promise<void>;
  clearChat: () => void;
  stopGeneration: () => void;
  activeModelDetails: {
    name: string;
    version: string;
    description: string;
    inputTokenLimit?: number;
    outputTokenLimit?: number;
  };
}

const PlaygroundContext = createContext<PlaygroundContextProps | undefined>(undefined);

export function PlaygroundProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState('');
  const [debouncedApiKey, setDebouncedApiKey] = useState('');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState('gemini-flash-latest');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Search modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Chat message logs
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Stats & Metrics
  const [latency, setLatency] = useState<number | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{ prompt: number; candidates: number; total: number } | null>(null);
  const [requestCount, setRequestCount] = useState(0);

  // Mobile responsiveness drawer states
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const [isToonEnabled, setIsToonEnabled] = useState(false);
  const [isRememberEnabled, setIsRememberEnabled] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isInitial = useRef(true);
  const loadedRef = useRef(false);

  // Initialize client-side states safely
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_tester_api_key') || getCookie('gemini_api_key') || getCookie('gemini_tester_api_key') || '';
    setApiKey(savedKey);
    setDebouncedApiKey(savedKey);

    const savedReqCount = Number(localStorage.getItem('gemini_tester_req_count')) || 0;
    setRequestCount(savedReqCount);

    const savedLatency = localStorage.getItem('gemini_tester_last_latency');
    if (savedLatency) setLatency(Number(savedLatency));

    const savedTokenUsage = localStorage.getItem('gemini_tester_last_token_usage');
    if (savedTokenUsage) {
      try {
        setTokenUsage(JSON.parse(savedTokenUsage));
      } catch (_) { }
    }

    const savedTheme = localStorage.getItem('gemini_tester_theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load messages from IndexedDB
    getMessagesFromDB().then((history) => {
      if (history && history.length > 0) {
        const loaded = history.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(loaded);
      }
    }).catch((err) => {
      console.warn('Could not read chat history from IndexedDB:', err);
    }).finally(() => {
      // Set initialized flag ONLY after messages are loaded to prevent empty overwrite
      setTimeout(() => {
        loadedRef.current = true;
      }, 0);
    });
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

  // Debounce API Key changes
  useEffect(() => {
    if (!apiKey) {
      setDebouncedApiKey('');
      return;
    }
    if (isInitial.current) {
      setDebouncedApiKey(apiKey);
      isInitial.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedApiKey(apiKey);
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, [apiKey]);

  // Sync API Key to storage & fetch models
  useEffect(() => {
    if (!loadedRef.current) {
      return;
    }
    if (debouncedApiKey) {
      localStorage.setItem('gemini_tester_api_key', debouncedApiKey);
      setCookie('gemini_api_key', debouncedApiKey);
      setCookie('gemini_tester_api_key', debouncedApiKey);
      fetchModels(debouncedApiKey);
    } else {
      localStorage.removeItem('gemini_tester_api_key');
      removeCookie('gemini_api_key');
      removeCookie('gemini_tester_api_key');
      setModels([]);
    }
  }, [debouncedApiKey]);

  // Sync Request Count
  useEffect(() => {
    if (!loadedRef.current) return;
    localStorage.setItem('gemini_tester_req_count', requestCount.toString());
  }, [requestCount]);

  // Sync Messages/Chat History to IndexedDB (including files and images)
  useEffect(() => {
    if (!loadedRef.current) return;
    saveMessagesToDB(messages);
  }, [messages]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSending(false);
  };

  const clearChat = () => {
    setMessages([]);
    clearMessagesFromDB();
  };

  const fetchModels = async (keyToUse: string | object = apiKey) => {
    const actualKey = typeof keyToUse === 'string' ? keyToUse : apiKey;

    if (!actualKey.trim()) {
      setModels([]);
      setModelError('Please enter a Gemini API Key to fetch models.');
      return;
    }

    setIsLoadingModels(true);
    setModelError(null);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${actualKey}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.models && Array.isArray(data.models)) {
        const mapped: ModelInfo[] = data.models.map((m: any) => ({
          name: m.name.replace('models/', ''),
          version: m.version || 'unknown',
          description: m.description || '',
          supportedGenerationMethods: m.supportedGenerationMethods || [],
          inputTokenLimit: m.inputTokenLimit,
          outputTokenLimit: m.outputTokenLimit
        }));
        setModels(mapped);

        // Auto-select first model if activeModel isn't in list
        const exists = mapped.some(m => m.name === activeModel);
        if (!exists && mapped.length > 0) {
          setActiveModel(mapped[0].name);
        }
      } else {
        throw new Error('No models found in the list response.');
      }
    } catch (err: any) {
      console.warn('Model fetch error:', err);
      setModelError(err.message || 'Failed to list available models.');
      setModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSendMessage = async (text: string, files: Attachment[]) => {
    if (!text.trim() && files.length === 0) return;
    if (!apiKey.trim()) {
      alert('Please enter a Gemini API Key to chat.');
      return;
    }

    const currentInput = text;
    const currentAttachments = [...files];

    let finalInputText = currentInput;
    if (isToonEnabled && currentInput.trim()) {
      try {
        const parsed = JSON.parse(currentInput.trim());
        finalInputText = encode(parsed);
      } catch (_) {
        // Fallback to original text if not valid JSON
      }
    }

    const newUserMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      text: finalInputText,
      attachments: currentAttachments,
      timestamp: new Date(),
      isToonEnabled: isToonEnabled
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsSending(true);
    setLatency(null);
    setTokenUsage(null);

    const startTime = performance.now();

    try {
      const parts: any[] = [];

      if (currentInput.trim()) {
        if (isToonEnabled) {
          try {
            const parsed = JSON.parse(currentInput.trim());
            const toonEncoded = encode(parsed);
            parts.push({ text: toonEncoded });
          } catch (_) {
            parts.push({ text: currentInput });
          }
        } else {
          parts.push({ text: currentInput });
        }
      }

      currentAttachments.forEach(att => {
        if (att.textContent) {
          if (att.name.endsWith('.json') && isToonEnabled) {
            try {
              const parsed = JSON.parse(att.textContent);
              const toonEncoded = encode(parsed);
              parts.push({
                text: `[File Attachment: ${att.name} (TOON Encoded)]\n\`\`\`toon\n${toonEncoded}\n\`\`\`\n`
              });
            } catch (_) {
              parts.push({
                text: `[File Attachment: ${att.name}]\n\`\`\`\n${att.textContent}\n\`\`\`\n`
              });
            }
          } else {
            parts.push({
              text: `[File Attachment: ${att.name}]\n\`\`\`\n${att.textContent}\n\`\`\`\n`
            });
          }
        }
      });

      currentAttachments.forEach(att => {
        if (att.dataUrl) {
          const split = att.dataUrl.split(',');
          const mimeType = split[0].split(';')[0].split(':')[1];
          const base64Data = split[1];
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
        }
      });

      const historyContents = messages.map(msg => {
        const histParts: any[] = [{ text: msg.text }];

        if (msg.attachments) {
          msg.attachments.forEach(att => {
            if (att.textContent) {
              histParts.push({ text: `[File Content: ${att.name}]\n${att.textContent}` });
            }
            if (att.dataUrl) {
              const split = att.dataUrl.split(',');
              const mime = split[0].split(';')[0].split(':')[1];
              histParts.push({
                inlineData: {
                  mimeType: mime,
                  data: split[1]
                }
              });
            }
          });
        }

        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: histParts
        };
      });

      const requestContents = isRememberEnabled
        ? [
            ...historyContents,
            {
              role: 'user',
              parts: parts
            }
          ]
        : [
            {
              role: 'user',
              parts: parts
            }
          ];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: requestContents }),
        signal: controller.signal
      });

      const duration = performance.now() - startTime;
      const durationSeconds = duration / 1000;
      setLatency(durationSeconds);
      localStorage.setItem('gemini_tester_last_latency', durationSeconds.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (data.usageMetadata) {
        const promptTokens = data.usageMetadata.promptTokenCount || 0;
        const candidateTokens = data.usageMetadata.candidatesTokenCount || 0;
        const totalTokens = data.usageMetadata.totalTokenCount || 0;

        const totalUsage = {
          prompt: promptTokens,
          candidates: candidateTokens,
          total: totalTokens
        };

        const isPro = activeModel.includes('pro');
        const inputRate = isPro ? (1.25 / 1000000) : (0.075 / 1000000);
        const outputRate = isPro ? (5.00 / 1000000) : (0.30 / 1000000);

        const promptCostUSD = promptTokens * inputRate;
        const promptCostINR = promptCostUSD * 95.4;

        const candidateCostUSD = candidateTokens * outputRate;
        const candidateCostINR = candidateCostUSD * 95.4;

        setTokenUsage(totalUsage);
        localStorage.setItem('gemini_tester_last_token_usage', JSON.stringify(totalUsage));

        const newModelMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'model',
          text: textResponse,
          timestamp: new Date(),
          latency: durationSeconds,
          isToonEnabled: isToonEnabled,
          tokens: {
            prompt: 0,
            candidates: candidateTokens,
            total: candidateTokens
          },
          cost: {
            usd: candidateCostUSD.toFixed(6),
            inr: candidateCostINR.toFixed(4)
          }
        };

        setMessages(prev => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].role === 'user') {
              updated[i] = {
                ...updated[i],
                tokens: {
                  prompt: promptTokens,
                  candidates: 0,
                  total: promptTokens
                },
                cost: {
                  usd: promptCostUSD.toFixed(6),
                  inr: promptCostINR.toFixed(4)
                }
              };
              break;
            }
          }
          return [...updated, newModelMessage];
        });
      } else {
        const newModelMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'model',
          text: textResponse,
          timestamp: new Date(),
          latency: durationSeconds,
          isToonEnabled: isToonEnabled
        };
        setMessages(prev => [...prev, newModelMessage]);
      }
      setRequestCount(prev => prev + 1);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const cancelledMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'model',
          text: `🛑 Generation stopped by user.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, cancelledMessage]);
        return;
      }
      console.warn('Chat request error:', err);
      const durationSeconds = (performance.now() - startTime) / 1000;
      setLatency(durationSeconds);
      localStorage.setItem('gemini_tester_last_latency', durationSeconds.toString());
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'model',
        text: `⚠️ Error: ${err.message || 'An error occurred while connecting to the model.'}`,
        timestamp: new Date(),
        latency: durationSeconds
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      abortControllerRef.current = null;
      setIsSending(false);
    }
  };

  const activeModelDetails = models.find(m => m.name === activeModel) || {
    name: activeModel,
    version: 'unknown',
    description: 'Default reasoning flash model',
    inputTokenLimit: 1048576,
    outputTokenLimit: 8192
  };

  return (
    <PlaygroundContext.Provider
      value={{
        apiKey,
        setApiKey,
        debouncedApiKey,
        models,
        isLoadingModels,
        modelError,
        activeModel,
        setActiveModel,
        theme,
        toggleTheme,
        isSearchModalOpen,
        setIsSearchModalOpen,
        messages,
        setMessages,
        isSending,
        latency,
        tokenUsage,
        requestCount,
        isLeftSidebarOpen,
        setIsLeftSidebarOpen,
        isRightSidebarOpen,
        setIsRightSidebarOpen,
        isToonEnabled,
        setIsToonEnabled,
        isRememberEnabled,
        setIsRememberEnabled,

        fetchModels,
        handleSendMessage,
        clearChat,
        stopGeneration,
        activeModelDetails
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error('usePlayground must be used within a PlaygroundProvider');
  }
  return context;
}
