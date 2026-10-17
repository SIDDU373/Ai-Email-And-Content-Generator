'use client';

import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Copy, 
  Bookmark, 
  ArrowRight, 
  Sparkles, 
  ArrowLeftRight,
  RotateCcw
} from 'lucide-react';
import { cn, copyToClipboard } from '@/lib/utils';
import { RewriteActionType, ToneType } from '@/lib/types';
import { api } from '@/lib/api';

interface RewriteCompareProps {
  originalText: string;
  revisedText: string;
  action: RewriteActionType;
  targetTone?: ToneType;
  summaryOfChanges: string;
  modelUsed?: string;
  onAccept: (revised: string) => void;
  onReject: () => void;
}

export function RewriteCompare({
  originalText,
  revisedText,
  action,
  targetTone,
  summaryOfChanges,
  modelUsed,
  onAccept,
  onReject,
}: RewriteCompareProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(revisedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await api.createDraft({
        title: `Rewrite: ${action.replace('_', ' ')} (${revisedText.slice(0, 30)}...)`,
        task_type: 'rewrite',
        format: 'text',
        content: revisedText,
        metadata: {
          original_text: originalText,
          action,
          target_tone: targetTone,
          summary_of_changes: summaryOfChanges,
        }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-paper-300 shadow-card overflow-hidden space-y-0">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-paper-200 bg-paper-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-ink-800">
            Precision Revision Comparison
          </span>
          <span className="text-xs text-ink-400 font-mono px-2 py-0.5 rounded bg-paper-200">
            {action.replace('_', ' ')}
          </span>
        </div>

        {/* Comparison Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-paper-300 text-ink-700 hover:bg-paper-100 flex items-center gap-1.5 transition-colors shadow-subtle"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-500" />}
            <span>{copied ? 'Copied' : 'Copy Revised'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-paper-300 text-ink-700 hover:bg-paper-100 flex items-center gap-1.5 transition-colors shadow-subtle disabled:opacity-50"
          >
            <Bookmark className="w-3.5 h-3.5 text-brand-600" />
            <span>{saved ? 'Saved!' : 'Save Revised'}</span>
          </button>

          <button
            type="button"
            onClick={onReject}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-paper-100 hover:bg-paper-200 text-ink-600 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>

          <button
            type="button"
            onClick={() => onAccept(revisedText)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5 transition-colors shadow-subtle"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept Revision</span>
          </button>
        </div>
      </div>

      {/* Summary of changes banner */}
      {summaryOfChanges && (
        <div className="px-5 py-2.5 bg-brand-50/60 border-b border-brand-100 text-xs text-brand-900 flex items-center gap-2">
          <span className="font-semibold text-brand-700 uppercase tracking-wider text-[10px]">What Changed:</span>
          <span>{summaryOfChanges}</span>
        </div>
      )}

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-paper-200">
        {/* Original */}
        <div className="p-5 flex flex-col bg-paper-50/40">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-paper-200">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Original Text (Preserved)
            </span>
            <span className="text-[11px] text-ink-400">
              {originalText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <div className="text-sm text-ink-600 leading-relaxed font-sans whitespace-pre-wrap flex-1">
            {originalText}
          </div>
        </div>

        {/* Revised */}
        <div className="p-5 flex flex-col bg-white">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-paper-200">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Revised & Polished
            </span>
            <span className="text-[11px] text-ink-400">
              {revisedText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <div className="text-sm text-ink-900 leading-relaxed font-sans whitespace-pre-wrap flex-1">
            {revisedText}
          </div>
        </div>
      </div>
    </div>
  );
}
