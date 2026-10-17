'use client';

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Bookmark, 
  Download, 
  Sparkles, 
  ChevronRight, 
  FileText, 
  Layers, 
  Info,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { cn, countWords, copyToClipboard, downloadFile } from '@/lib/utils';
import { EmailVariation, EnhancedPromptSpec } from '@/lib/types';
import { api } from '@/lib/api';
import Link from 'next/link';

interface EditorWorkspaceProps {
  initialSubject?: string;
  initialBody: string;
  variations?: EmailVariation[];
  modelUsed?: string;
  isMock?: boolean;
  promptSpec?: EnhancedPromptSpec;
  taskType?: string;
  format?: string;
  onSaveSuccess?: () => void;
}

export function EditorWorkspace({
  initialSubject = '',
  initialBody,
  variations = [],
  modelUsed = '',
  isMock = false,
  promptSpec,
  taskType = 'email',
  format = 'email',
  onSaveSuccess
}: EditorWorkspaceProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [activeTab, setActiveTab] = useState<'primary' | number>('primary');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showSpec, setShowSpec] = useState(false);

  // Sync state if props change (e.g. after fresh generation)
  React.useEffect(() => {
    setSubject(initialSubject);
    setBody(initialBody);
    setActiveTab('primary');
    setSavedId(null);
    setSaveMessage(null);
  }, [initialSubject, initialBody]);

  const handleSelectVariation = (variantId: number) => {
    const variation = variations.find((v) => v.variant_id === variantId);
    if (variation) {
      setActiveTab(variantId);
      setSubject(variation.subject);
      setBody(variation.body);
    }
  };

  const handleSelectPrimary = () => {
    setActiveTab('primary');
    setSubject(initialSubject);
    setBody(initialBody);
  };

  const handleCopy = async () => {
    const fullText = subject ? `Subject: ${subject}\n\n${body}` : body;
    const ok = await copyToClipboard(fullText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      const title = subject || body.slice(0, 50).trim() || 'Untitled Draft';
      const draft = await api.createDraft({
        title,
        task_type: taskType,
        format,
        subject: subject || undefined,
        content: body,
        metadata: {
          model_used: modelUsed,
          is_mock: isMock,
        }
      });
      setSavedId(draft.id);
      setSaveMessage('Saved to drafts');
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = (exportType: 'markdown' | 'text') => {
    const filename = `${(subject || 'writeflow-draft').toLowerCase().replace(/[^a-z0-9]/g, '-')}.${exportType === 'markdown' ? 'md' : 'txt'}`;
    const content = subject 
      ? `# ${subject}\n\n${body}` 
      : body;
    downloadFile(content, filename, exportType === 'markdown' ? 'text/markdown' : 'text/plain');
  };

  const wordCount = countWords(body);
  const charCount = body.length;

  return (
    <div className="bg-white rounded-xl border border-paper-300 shadow-card flex flex-col overflow-hidden">
      {/* Top action & variation bar */}
      <div className="px-5 py-3 border-b border-paper-200 bg-paper-50/70 flex flex-wrap items-center justify-between gap-3">
        {/* Variation tabs */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSelectPrimary}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeTab === 'primary'
                ? "bg-white text-ink-900 shadow-subtle border border-paper-300"
                : "text-ink-500 hover:text-ink-800 hover:bg-paper-200/50"
            )}
          >
            Draft 1 (Primary)
          </button>

          {variations.map((v) => (
            <button
              key={v.variant_id}
              type="button"
              onClick={() => handleSelectVariation(v.variant_id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                activeTab === v.variant_id
                  ? "bg-white text-ink-900 shadow-subtle border border-paper-300"
                  : "text-ink-500 hover:text-ink-800 hover:bg-paper-200/50"
              )}
            >
              Variation {v.variant_id}
            </button>
          ))}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {promptSpec && (
            <button
              type="button"
              onClick={() => setShowSpec(!showSpec)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors",
                showSpec 
                  ? "bg-brand-50 border-brand-300 text-brand-700" 
                  : "bg-white border-paper-300 text-ink-600 hover:bg-paper-100"
              )}
              title="View structured prompt specification"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Spec</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-paper-300 text-ink-700 hover:bg-paper-100 flex items-center gap-1.5 transition-colors shadow-subtle"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-500" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-paper-300 text-ink-700 hover:bg-paper-100 flex items-center gap-1.5 transition-colors shadow-subtle disabled:opacity-50"
            title="Save to Drafts database"
          >
            <Bookmark className="w-3.5 h-3.5 text-brand-600" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <div className="relative group">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-paper-300 text-ink-700 hover:bg-paper-100 flex items-center gap-1.5 transition-colors shadow-subtle"
            >
              <Download className="w-3.5 h-3.5 text-ink-500" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lifted border border-paper-200 py-1 hidden group-hover:block z-20">
              <button
                type="button"
                onClick={() => handleExport('markdown')}
                className="w-full text-left px-3 py-1.5 text-xs text-ink-700 hover:bg-paper-100"
              >
                Markdown (.md)
              </button>
              <button
                type="button"
                onClick={() => handleExport('text')}
                className="w-full text-left px-3 py-1.5 text-xs text-ink-700 hover:bg-paper-100"
              >
                Plain Text (.txt)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save feedback banner */}
      {saveMessage && (
        <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{saveMessage}</span>
          <Link href="/drafts" className="font-semibold underline hover:text-emerald-900 ml-2">
            View in Drafts
          </Link>
        </div>
      )}

      {/* Prompt Spec Drawer */}
      {showSpec && promptSpec && (
        <div className="p-4 bg-paper-100/70 border-b border-paper-200 text-xs text-ink-700 space-y-2">
          <div className="font-semibold text-ink-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Structured Writing Task Specification (P1)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            <div><span className="text-ink-400 font-medium">Objective:</span> {promptSpec.objective}</div>
            <div><span className="text-ink-400 font-medium">Audience:</span> {promptSpec.audience}</div>
            <div><span className="text-ink-400 font-medium">Format:</span> {promptSpec.format}</div>
            <div><span className="text-ink-400 font-medium">Tone:</span> {promptSpec.tone}</div>
          </div>
          {promptSpec.restrictions && promptSpec.restrictions.length > 0 && (
            <div className="text-[11px] text-ink-500">
              <span className="font-medium text-ink-600">Restrictions:</span> {promptSpec.restrictions.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Subject Line (if email/titled format) */}
      {subject !== undefined && (
        <div className="px-5 py-3 border-b border-paper-200 flex items-center gap-3">
          <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider w-16">
            Subject:
          </span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 text-sm font-semibold text-ink-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-ink-300"
            placeholder="Email Subject Line..."
          />
        </div>
      )}

      {/* Main editable text area */}
      <div className="p-5 flex-1 min-h-[340px] flex flex-col">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full flex-1 resize-none bg-transparent border-none outline-none focus:ring-0 text-ink-800 leading-relaxed text-sm md:text-base font-sans placeholder:text-ink-300 min-h-[300px]"
          placeholder="Start writing or let WriteFlow generate your draft..."
        />
      </div>

      {/* Footer bar with stats and quick rewrite shortcuts */}
      <div className="px-5 py-3 border-t border-paper-200 bg-paper-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span className="text-paper-300">•</span>
          <span>{charCount} characters</span>
          {modelUsed && (
            <>
              <span className="text-paper-300">•</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[11px] font-mono",
                isMock ? "bg-amber-100 text-amber-800" : "bg-brand-50 text-brand-800"
              )}>
                {modelUsed}
              </span>
            </>
          )}
        </div>

        {/* Quick rewrite actions */}
        <div className="flex items-center gap-2">
          <span className="text-ink-400 text-[11px] hidden sm:inline">Refine:</span>
          <Link
            href={`/rewrite?text=${encodeURIComponent(body)}&action=improve_clarity`}
            className="px-2 py-1 rounded bg-white hover:bg-paper-100 border border-paper-300 text-[11px] font-medium text-ink-700 transition-colors shadow-subtle"
          >
            Clarity
          </Link>
          <Link
            href={`/rewrite?text=${encodeURIComponent(body)}&action=shorten`}
            className="px-2 py-1 rounded bg-white hover:bg-paper-100 border border-paper-300 text-[11px] font-medium text-ink-700 transition-colors shadow-subtle"
          >
            Shorten
          </Link>
          <Link
            href={`/rewrite?text=${encodeURIComponent(body)}&action=make_professional`}
            className="px-2 py-1 rounded bg-white hover:bg-paper-100 border border-paper-300 text-[11px] font-medium text-ink-700 transition-colors shadow-subtle"
          >
            More Professional
          </Link>
        </div>
      </div>
    </div>
  );
}
