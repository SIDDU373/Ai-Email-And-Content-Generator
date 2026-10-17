'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  AlertCircle, 
  Copy, 
  Check, 
  Bookmark, 
  Download, 
  FileText,
  Share2,
  Megaphone,
  MessageSquare,
  Mail,
  FileCode
} from 'lucide-react';
import { ToneSelector } from '@/components/ToneSelector';
import { LengthSelector } from '@/components/LengthSelector';
import { FormatSelector } from '@/components/FormatSelector';
import { 
  ContentFormatType, 
  ToneType, 
  LengthType, 
  ContentGenerateResponse,
  ContentItemResponse
} from '@/lib/types';
import { api } from '@/lib/api';
import { cn, copyToClipboard, downloadFile, countWords } from '@/lib/utils';
import Link from 'next/link';

function ContentGeneratorForm() {
  const searchParams = useSearchParams();

  const [brief, setBrief] = useState('');
  const [formats, setFormats] = useState<ContentFormatType[]>([
    'email',
    'social_post',
    'announcement'
  ]);
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState<ToneType>('professional');
  const [length, setLength] = useState<LengthType>('balanced');
  const [constraints, setConstraints] = useState('');
  const [applyProfile, setApplyProfile] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContentGenerateResponse | null>(null);

  // Active view tab
  const [activeFormat, setActiveFormat] = useState<ContentFormatType>('email');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [savedFormat, setSavedFormat] = useState<string | null>(null);

  // Editable output text per format
  const [editableOutputs, setEditableOutputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const qBrief = searchParams.get('brief');
    if (qBrief) setBrief(qBrief);
  }, [searchParams]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.trim()) {
      setError('Please provide a source brief or topic.');
      return;
    }
    if (formats.length === 0) {
      setError('Please select at least one target output format.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.generateContent({
        brief,
        formats,
        target_audience: targetAudience || undefined,
        tone,
        length,
        constraints: constraints || undefined,
        apply_profile: applyProfile,
      });

      setResult(res);
      // Initialize editable texts
      const edits: Record<string, string> = {};
      res.items.forEach((item) => {
        edits[item.format] = item.content;
      });
      setEditableOutputs(edits);
      if (res.items.length > 0) {
        setActiveFormat(res.items[0].format);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate content. Please check provider status.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (fmt: string) => {
    const text = editableOutputs[fmt] || '';
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedFormat(fmt);
      setTimeout(() => setCopiedFormat(null), 2000);
    }
  };

  const handleSaveDraft = async (item: ContentItemResponse) => {
    try {
      const content = editableOutputs[item.format] || item.content;
      await api.createDraft({
        title: item.title || `${item.format} Draft`,
        task_type: 'content',
        format: item.format,
        content,
        metadata: {
          brief: brief.slice(0, 100),
          model_used: result?.model_used,
        }
      });
      setSavedFormat(item.format);
      setTimeout(() => setSavedFormat(null), 2500);
    } catch {
      //
    }
  };

  const currentItem = result?.items.find((i) => i.format === activeFormat);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          <Sparkles className="w-4 h-4" />
          <span>P0 Multi-Format Generation</span>
        </div>
        <h1 className="editorial-title text-2xl sm:text-3xl font-bold text-ink-900 mt-1">
          Transform One Brief into Multiple Formats
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1 max-w-2xl">
          Write once. Generate audience-tailored emails, social posts, article outlines, announcements, 
          and short messages without copy-pasting across different prompts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Brief Input Form */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-5 bg-white p-6 rounded-xl border border-paper-300 shadow-card">
          {/* Target Formats Multi-select */}
          <FormatSelector selected={formats} onChange={setFormats} />

          {/* Unified Brief Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
              Source Brief / Core Topic <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              required
              placeholder="Paste your rough notes, meeting takeaways, feature summary, or core message..."
              className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-3 focus:bg-white focus:border-brand-500 outline-none transition-colors placeholder:text-ink-400 font-sans"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-600">
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Existing B2B customers, leadership team, public LinkedIn audience"
              className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none transition-colors placeholder:text-ink-400"
            />
          </div>

          {/* Tone Selector */}
          <ToneSelector value={tone} onChange={setTone} />

          {/* Length Selector */}
          <LengthSelector value={length} onChange={setLength} />

          {/* Specific Constraints */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-600">
              Special Constraints or Exclusions
            </label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. Mention 20% early-bird discount; do not use jargon"
              className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none transition-colors placeholder:text-ink-400"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label htmlFor="apply-profile-content" className="text-xs text-ink-700 cursor-pointer">
              Apply Personal Writing Profile:
            </label>
            <input
              id="apply-profile-content"
              type="checkbox"
              checked={applyProfile}
              onChange={(e) => setApplyProfile(e.target.checked)}
              className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-ink-900 hover:bg-ink-800 text-paper-50 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-subtle disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>{loading ? `Generating ${formats.length} Formats...` : `Generate ${formats.length} Content Outputs`}</span>
          </button>
        </form>

        {/* Right Column: Multi-Format Output Workspace */}
        <div className="lg:col-span-7">
          {result && result.items.length > 0 ? (
            <div className="bg-white rounded-xl border border-paper-300 shadow-card flex flex-col overflow-hidden">
              {/* Format Switcher Tabs */}
              <div className="px-5 py-3 border-b border-paper-200 bg-paper-50/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {result.items.map((item) => {
                    const isActive = activeFormat === item.format;
                    return (
                      <button
                        key={item.format}
                        type="button"
                        onClick={() => setActiveFormat(item.format)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap",
                          isActive
                            ? "bg-white text-ink-900 shadow-subtle border border-paper-300"
                            : "text-ink-500 hover:text-ink-800 hover:bg-paper-200/50"
                        )}
                      >
                        {item.format.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Actions */}
                {currentItem && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(currentItem.format)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-paper-300 text-ink-700 hover:bg-paper-100 flex items-center gap-1.5 transition-colors shadow-subtle"
                    >
                      {copiedFormat === currentItem.format ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-500" />}
                      <span>{copiedFormat === currentItem.format ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveDraft(currentItem)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-paper-300 text-ink-700 hover:bg-paper-100 flex items-center gap-1.5 transition-colors shadow-subtle"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-brand-600" />
                      <span>{savedFormat === currentItem.format ? 'Saved!' : 'Save Draft'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Editable Content Area */}
              {currentItem && (
                <div className="p-5 flex-1 flex flex-col space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink-400">
                    {currentItem.title || currentItem.format.replace('_', ' ')}
                  </div>
                  <textarea
                    value={editableOutputs[currentItem.format] ?? currentItem.content}
                    onChange={(e) => {
                      setEditableOutputs({
                        ...editableOutputs,
                        [currentItem.format]: e.target.value
                      });
                    }}
                    rows={12}
                    className="w-full flex-1 resize-none bg-transparent border-none outline-none focus:ring-0 text-ink-800 leading-relaxed text-sm font-sans min-h-[300px]"
                  />
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-3 border-t border-paper-200 bg-paper-50/50 flex items-center justify-between text-xs text-ink-500">
                <div className="flex items-center gap-2">
                  <span>{countWords(editableOutputs[activeFormat] || '')} words</span>
                  <span className="text-paper-300">•</span>
                  <span className="font-mono text-[11px] text-brand-700">{result.model_used}</span>
                </div>
                <Link
                  href={`/rewrite?text=${encodeURIComponent(editableOutputs[activeFormat] || '')}`}
                  className="text-brand-600 font-semibold hover:underline"
                >
                  Send to Precision Rewrite →
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-paper-300 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-3">
              <div className="w-12 h-12 rounded-full bg-paper-100 text-ink-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-ink-800">
                Multi-Format Workspace Ready
              </h3>
              <p className="text-xs text-ink-500 max-w-sm leading-relaxed">
                Enter your brief, select the desired formats (e.g. Email, Social Post, Announcement), 
                and WriteFlow will generate tailored outputs respecting each format's distinct structure.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContentGeneratorPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-ink-400">Loading content workspace...</div>}>
      <ContentGeneratorForm />
    </Suspense>
  );
}
