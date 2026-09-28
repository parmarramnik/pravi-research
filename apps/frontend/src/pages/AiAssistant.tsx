import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import { useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Database,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  factsUsed?: any;
  suggestions?: string[];
  timestamp: string;
}

/**
 * Format markdown inline tokens: **bold**, `code`, etc.
 */
function renderInlineFormatted(text: string): React.ReactNode {
  // Regex to split by **bold** or `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={i} className="text-white font-semibold">
          {inner}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={i}
          className="font-mono text-[11px] bg-[#0b1120] text-indigo-300 px-1.5 py-0.5 border border-[#1f2937] mx-0.5"
        >
          {inner}
        </code>
      );
    }
    return part;
  });
}

/**
 * High-readability structured AI response renderer
 */
const FormattedAiContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-1.5 my-2 pl-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // Heading 3: ### Title
    if (trimmed.startsWith('### ')) {
      flushList();
      const title = trimmed.replace('### ', '');
      elements.push(
        <div
          key={`h3-${index}`}
          className="mt-3 mb-2 pb-1 border-b border-[#1f2937] flex items-center space-x-2"
        >
          <div className="w-1.5 h-3.5 bg-indigo-500"></div>
          <h3 className="text-sm font-bold text-white font-sans tracking-tight">
            {renderInlineFormatted(title)}
          </h3>
        </div>
      );
      return;
    }

    // Heading 4 or 2: ## Title or #### Title
    if (trimmed.startsWith('## ') || trimmed.startsWith('#### ')) {
      flushList();
      const title = trimmed.replace(/^[#]+\s*/, '');
      elements.push(
        <h4 key={`h4-${index}`} className="text-xs font-bold text-indigo-300 mt-2.5 mb-1 uppercase font-mono">
          {renderInlineFormatted(title)}
        </h4>
      );
      return;
    }

    // Bullet points: * or -
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      inList = true;
      const text = trimmed.slice(2);
      const isNested = line.startsWith('    * ') || line.startsWith('    - ') || line.startsWith('\t* ') || line.startsWith('\t- ');

      listItems.push(
        <li
          key={`li-${index}`}
          className={`flex items-start space-x-2 text-xs text-slate-200 leading-relaxed ${
            isNested ? 'ml-5 pl-2 border-l border-[#1f2937] text-slate-300' : ''
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-none bg-indigo-400 mt-1.5 shrink-0"></span>
          <div className="flex-1">{renderInlineFormatted(text)}</div>
        </li>
      );
      return;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={`p-${index}`} className="text-xs text-slate-200 leading-relaxed my-1.5">
        {renderInlineFormatted(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
};

export const AiAssistant: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId') || '';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        '### Ahmedabad Infrastructure Intelligence Copilot\n\nI am connected directly to the **PostgreSQL database, PostGIS spatial registry, and deterministic risk engine** for Ahmedabad.\n\n* **Factual Grounding:** Answers are extracted from verified municipal asset records.\n* **No Hallucinated Risk:** Official risk scores are computed deterministically by the Risk Service.\n* **Cascading Impact:** Queries identify dependent hospitals, water facilities, and transit nodes.\n\nSelect a suggested query below or ask any operational question:',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Why is Torrent Power 220kV Master Grid Substation (ELC-000001) critical to Ahmedabad?',
        'Which infrastructure assets depend on Kotarpur Water Treatment Plant?',
        'Show all critical infrastructure assets in Ahmedabad',
        'Which bridges and flyovers need inspection across the Sabarmati?',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [assetId, setAssetId] = useState(preselectedAssetId);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, loading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'init-restart',
        role: 'assistant',
        content: 'Chat session reset. You may ask a new question regarding Ahmedabad municipal infrastructure.',
        timestamp: new Date().toISOString(),
        suggestions: [
          'Show all critical infrastructure assets in Ahmedabad',
          'Why is Torrent Power 220kV Master Grid Substation (ELC-000001) critical to Ahmedabad?',
          'Which water facilities supply Ahmedabad Civil Hospital?',
        ],
      },
    ]);
  };

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const history = messages.slice(-4).map((m) => ({ role: m.role, content: m.content }));
      const res = await apiClient.post('/ai/chat', {
        query: q,
        assetId: assetId || undefined,
        history,
      });

      if (res.data.success && res.data.data) {
        const aiMsg: ChatMessage = {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          content: res.data.data.answer,
          factsUsed: res.data.data.factsUsed,
          suggestions: res.data.data.suggestions,
          timestamp: res.data.data.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('AI response unsuccessful');
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content:
            'I encountered a communication timeout querying the infrastructure telemetry layer. Please retry your request.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col bg-[#0b1120] border border-[#1f2937]">
      {/* Header Bar */}
      <div className="p-3.5 border-b border-[#1f2937] flex items-center justify-between bg-[#0e1626]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center text-white font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-white tracking-tight font-sans">
                AHMEDABAD INFRASTRUCTURE AI ASSISTANT
              </h1>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 border border-emerald-800">
                GEMINI 2.5 FLASH GROUNDED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Natural-language queries backed by real PostgreSQL data, PostGIS geometry, and rule-based risk engines
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {assetId && (
            <div className="text-xs font-mono text-indigo-300 bg-[#111827] px-2.5 py-1 border border-[#1f2937] flex items-center space-x-1.5">
              <span>PINNED ASSET: {assetId.substring(0, 11)}</span>
              <button
                onClick={() => setAssetId('')}
                className="text-slate-400 hover:text-white ml-1 font-bold"
                title="Remove asset context filter"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-[#111827] border border-[#1f2937]"
            title="Reset Chat Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#080d1a]">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-3xl border ${
                  isUser
                    ? 'bg-indigo-600 border-indigo-500 text-white p-3.5'
                    : 'bg-[#111827] border-[#1f2937] text-slate-100 p-4 w-full md:w-auto shadow-sm'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1f2937] text-[11px] font-mono">
                  <div className="flex items-center space-x-2">
                    {isUser ? (
                      <>
                        <User className="w-3.5 h-3.5 text-indigo-200" />
                        <span className="font-semibold text-white">OPERATOR</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-semibold text-indigo-300">GEMINI ASSISTANT</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400">DATABASE GROUNDED</span>
                      </>
                    )}
                    <span className="text-slate-400">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="text-slate-400 hover:text-white flex items-center space-x-1 px-1.5 py-0.5 hover:bg-[#1f2937]"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-mono">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px] font-mono">Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Formatted Message Body */}
                <div className="font-sans">
                  {isUser ? (
                    <div className="text-xs font-mono text-white whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <FormattedAiContent content={m.content} />
                  )}
                </div>

                {/* Grounded Database Facts Tag */}
                {m.factsUsed && Object.keys(m.factsUsed).length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#1f2937] bg-[#0b1120] p-2.5 font-mono text-[11px] text-slate-400 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase text-[10px]">
                      <Database className="w-3 h-3" />
                      <span>Verified System Facts Queried from PostgreSQL:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-slate-300">
                      {m.factsUsed.assetCode && (
                        <span className="bg-[#111827] px-2 py-0.5 border border-[#1f2937]">
                          Code: <strong className="text-white">{m.factsUsed.assetCode}</strong>
                        </span>
                      )}
                      {m.factsUsed.healthScore !== undefined && (
                        <span className="bg-[#111827] px-2 py-0.5 border border-[#1f2937]">
                          Health: <strong className="text-emerald-400">{m.factsUsed.healthScore}/100</strong>
                        </span>
                      )}
                      {m.factsUsed.riskScore !== undefined && (
                        <span className="bg-[#111827] px-2 py-0.5 border border-[#1f2937]">
                          Risk: <strong className="text-rose-400">{m.factsUsed.riskScore}/100</strong>
                        </span>
                      )}
                      {m.factsUsed.criticality && (
                        <span className="bg-[#111827] px-2 py-0.5 border border-[#1f2937]">
                          Criticality: <strong className="text-amber-400">{m.factsUsed.criticality}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Follow-up suggestion pills */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#1f2937] space-y-1.5">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Suggested Inquiries:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 bg-[#0b1120] hover:bg-[#1f2937] border border-[#1f2937] text-indigo-300 text-[11px] font-mono text-left flex items-center space-x-1.5"
                        >
                          <ChevronRight className="w-3 h-3 shrink-0 text-indigo-400" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#111827] border border-[#1f2937] p-3 text-xs font-mono text-indigo-300 flex items-center space-x-2.5">
              <span className="w-2 h-2 bg-indigo-500"></span>
              <span>Querying Ahmedabad asset registry, dependency graph & Google Gemini...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-[#1f2937] bg-[#0e1626] flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Ask about Ahmedabad assets, risk explanations, or cascading dependencies (e.g. 'Why is ELC-000001 critical?')..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-[#111827] border border-[#1f2937] px-3.5 py-2.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase flex items-center space-x-1.5"
        >
          <span>Submit</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
