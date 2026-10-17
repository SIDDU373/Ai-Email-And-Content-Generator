'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  RefreshCw, 
  Sparkles, 
  RotateCcw, 
  AlertCircle, 
  ArrowRight, 
  Sliders,
  CheckCircle2,
  Undo2
} from 'lucide-react';
import { RewriteCompare } from '@/components/RewriteCompare';
import { ToneSelector } from '@/components/ToneSelector';
import { 
  RewriteActionType, 
  ToneType, 
  RewriteResponse 
} from '@/lib/types';
import { api } from '@/lib/api';
import { cn, countWords } from '@/lib/utils';

const ACTIONS: { value: RewriteActionType; label: string; desc: string }[] = [
  { value: 'improve_clarity', label: 'Improve Clarity', desc: 'Flow & readability' },
  { value: 'fix_grammar', label: 'Fix Grammar', desc: 'Spelling, syntax & polish' },
  { value: 'shorten', label: 'Shorten', desc: 'Cut 30-50% wordiness' },
  { value: 'expand', label: 'Expand', desc: 'Elaborate with nuance' },
  { value: 'simplify', label: 'Simplify', desc: 'Plain English, zero jargon' },
  { value: 'make_professional', label: 'Make Professional', desc: 'Executive tone' },
  { value: 'make_friendly', label: 'Make Friendly', desc: 'Warm interpersonal voice' },
  { value: 'make_persuasive', label: 'Make Persuasive', desc: 'Sharpen CTA & urgency' },
  { value: 'change_tone', label: 'Change Tone', desc: 'Specific tone transformation' },
];

function RewriteForm() {
  const searchParams = useSearchParams();

  const [text, setText] = useState('');
  const [action, setAction] = useState<RewriteActionType>('improve_clarity');
  const [targetTone, setTargetTone] = useState<ToneType>('professional');
  const [customInstruction, setCustomInstruction] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RewriteResponse | null>(null);

  // History stack for undoing accepted edits
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const qText = searchParams.get('text');
    const qAction = searchParams.get('action') as RewriteActionType | null;
    const qTone = searchParams.get('tone') as ToneType | null;

    if (qText) setText(qText);
    if (qAction) setAction(qAction);
    if (qTone) setTargetTone(qTone);
  }, [searchParams]);

  const handleRewrite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) {
      setError('Please enter or paste the text you want to rewrite.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.rewriteText({
        text,
        action,
        target_tone: action === 'change_tone' ? targetTone : undefined,
        custom_instruction: customInstruction || undefined,
      });

      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to rewrite text.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (revised: string) => {
    setHistory((prev) => [...prev, text]);
    setText(revised);
    setResult(null);
  };

  const handleReject = () => {
    setResult(null);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prevText = history[history.length - 1];
      setText(prevText);
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
          <RefreshCw className="w-4 h-4" />
          <span>P0 Precision Text Editor</span>
        </div>
        <h1 className="editorial-title text-2xl sm:text-3xl font-bold text-ink-900 mt-1">
          Rewrite & Improve Text
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1 max-w-2xl">
          Sharpen clarity, eliminate filler, upgrade formality, or adapt tone. 
          Your original text is safely preserved and never replaced without your explicit acceptance.
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Card */}
        <div className="bg-white p-6 rounded-xl border border-paper-300 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
              Source Text to Rewrite <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3 text-xs text-ink-400">
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleUndo}
                  className="flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo last accept</span>
                </button>
              )}
              <span>{countWords(text)} words</span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste your rough email draft, paragraph, or proposal text here..."
            className="w-full text-sm text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-3.5 focus:bg-white focus:border-brand-500 outline-none transition-colors placeholder:text-ink-400 font-sans"
          />

          {/* Action pills grid */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
              Choose Revision Goal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {ACTIONS.map((act) => {
                const isSelected = action === act.value;
                return (
                  <button
                    key={act.value}
                    type="button"
                    onClick={() => setAction(act.value)}
                    className={cn(
                      "p-2.5 rounded-lg border text-left transition-all",
                      isSelected
                        ? "bg-white border-brand-600 ring-2 ring-brand-500/20 shadow-card"
                        : "bg-paper-100/60 border-paper-300 hover:bg-white hover:border-paper-400 text-ink-600"
                    )}
                  >
                    <div className={cn("text-xs font-semibold", isSelected ? "text-ink-900" : "text-ink-700")}>
                      {act.label}
                    </div>
                    <div className="text-[10px] text-ink-400 line-clamp-1">{act.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Selector if action is change_tone */}
          {action === 'change_tone' && (
            <ToneSelector value={targetTone} onChange={setTargetTone} className="pt-2" />
          )}

          {/* Custom Instruction */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-ink-600">
              Optional Custom Editing Direction
            </label>
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g. Ensure we emphasize that next Tuesday is the absolute cutoff"
              className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none transition-colors placeholder:text-ink-400"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleRewrite()}
              disabled={loading || !text.trim()}
              className="py-2.5 px-5 rounded-lg bg-ink-900 hover:bg-ink-800 text-paper-50 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-subtle disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4 text-amber-300", loading && "animate-spin")} />
              <span>{loading ? 'Refining Text...' : `Apply ${ACTIONS.find(a => a.value === action)?.label}`}</span>
            </button>
          </div>
        </div>

        {/* Results & Comparison View */}
        {result && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-600">
              Comparison & Review
            </h2>
            <RewriteCompare
              originalText={result.original_text}
              revisedText={result.revised_text}
              action={result.action}
              targetTone={result.target_tone}
              summaryOfChanges={result.summary_of_changes}
              modelUsed={result.model_used}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function RewritePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-ink-400">Loading rewrite workspace...</div>}>
      <RewriteForm />
    </Suspense>
  );
}
