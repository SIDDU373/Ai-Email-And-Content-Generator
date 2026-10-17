'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Send, 
  Sparkles, 
  RotateCcw, 
  AlertCircle, 
  Check, 
  HelpCircle,
  Layers,
  ChevronDown,
  Sliders
} from 'lucide-react';
import { ToneSelector } from '@/components/ToneSelector';
import { LengthSelector } from '@/components/LengthSelector';
import { EditorWorkspace } from '@/components/EditorWorkspace';
import { 
  EmailPurposeType, 
  ToneType, 
  LengthType, 
  EmailGenerateResponse 
} from '@/lib/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const USE_CASES = [
  { value: 'general', label: 'General Email' },
  { value: 'request', label: 'Actionable Request' },
  { value: 'follow_up', label: 'Project Follow-Up' },
  { value: 'meeting_scheduling', label: 'Meeting Scheduling' },
  { value: 'thank_you', label: 'Thank You & Appreciation' },
  { value: 'apology', label: 'Apology & Ownership' },
  { value: 'introduction', label: 'Introduction & Warm Intro' },
  { value: 'reminder', label: 'Gentle Reminder' },
  { value: 'polite_decline', label: 'Polite Decline / Pass' },
];

function EmailGeneratorForm() {
  const searchParams = useSearchParams();

  // Form State
  const [purpose, setPurpose] = useState('');
  const [useCase, setUseCase] = useState<EmailPurposeType>('general');
  const [recipient, setRecipient] = useState('');
  const [relationship, setRelationship] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [tone, setTone] = useState<ToneType>('professional');
  const [length, setLength] = useState<LengthType>('balanced');
  const [constraints, setConstraints] = useState('');
  const [applyProfile, setApplyProfile] = useState(true);
  const [numVariations, setNumVariations] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Status & Generation State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailGenerateResponse | null>(null);

  // Pre-fill from query parameters if present
  useEffect(() => {
    const qPurpose = searchParams.get('purpose');
    const qUseCase = searchParams.get('use_case') as EmailPurposeType | null;
    const qTone = searchParams.get('tone') as ToneType | null;
    const qLength = searchParams.get('length') as LengthType | null;

    if (qPurpose) setPurpose(qPurpose);
    if (qUseCase) setUseCase(qUseCase);
    if (qTone) setTone(qTone);
    if (qLength) setLength(qLength);
  }, [searchParams]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) {
      setError('Please provide the main purpose or subject of the email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.generateEmail({
        purpose,
        use_case: useCase,
        recipient: recipient || undefined,
        recipient_relationship: relationship || undefined,
        key_points: keyPoints || undefined,
        desired_outcome: desiredOutcome || undefined,
        tone,
        length,
        constraints: constraints || undefined,
        apply_profile: applyProfile,
        num_variations: numVariations,
      });

      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate email draft. Check your network or provider settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPurpose('');
    setRecipient('');
    setRelationship('');
    setKeyPoints('');
    setDesiredOutcome('');
    setConstraints('');
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
          <Mail className="w-4 h-4" />
          <span>P0 Executive Email Suite</span>
        </div>
        <h1 className="editorial-title text-2xl sm:text-3xl font-bold text-ink-900 mt-1">
          Compose Workplace Emails
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1 max-w-2xl">
          Craft audience-appropriate emails with guaranteed subject lines and structure. 
          Important missing details will be marked with clear placeholders rather than hallucinated facts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-5 bg-white p-6 rounded-xl border border-paper-300 shadow-card">
          {/* Use Case pills */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
              Scenario / Use Case
            </label>
            <select
              value={useCase}
              onChange={(e) => setUseCase(e.target.value as EmailPurposeType)}
              className="w-full text-xs font-medium text-ink-800 bg-paper-100/70 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none transition-colors"
            >
              {USE_CASES.map((uc) => (
                <option key={uc.value} value={uc.value}>
                  {uc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Main Purpose */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700">
              Purpose / Subject <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
              required
              placeholder="e.g. Follow up with the design client on brand logo revisions and schedule a 15-min alignment call"
              className="w-full text-sm text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-3 focus:bg-white focus:border-brand-500 outline-none transition-colors placeholder:text-ink-400"
            />
          </div>

          {/* Recipient & Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink-600">
                Recipient Name / Role
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Sarah Miller"
                className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none transition-colors placeholder:text-ink-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink-600">
                Relationship
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Enterprise Client / Executive"
                className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none transition-colors placeholder:text-ink-400"
              />
            </div>
          </div>

          {/* Key points or rough notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-600">
              Key Points & Rough Notes
            </label>
            <textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              rows={3}
              placeholder="• Reviewed version 2 logos&#10;• We recommend option B with slightly darker typography&#10;• Need approval before Thursday 3pm"
              className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none transition-colors placeholder:text-ink-400 font-sans"
            />
          </div>

          {/* Desired outcome */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-600">
              Desired Outcome / Call to Action
            </label>
            <input
              type="text"
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="e.g. Confirm approval by reply email or pick a slot on Calendly"
              className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none transition-colors placeholder:text-ink-400"
            />
          </div>

          {/* Tone Selector */}
          <ToneSelector value={tone} onChange={setTone} />

          {/* Length Selector */}
          <LengthSelector value={length} onChange={setLength} />

          {/* Advanced progressive disclosure */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink-800 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3.5 bg-paper-100/60 rounded-lg border border-paper-200 space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-ink-600">
                    Constraints or Guardrails
                  </label>
                  <input
                    type="text"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="e.g. Do not mention pricing; keep under 80 words"
                    className="w-full text-xs bg-white border border-paper-300 rounded-lg p-2 text-ink-900 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-ink-700 font-medium">
                    Generate Variations:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumVariations(num)}
                        className={cn(
                          "w-7 h-7 rounded text-xs font-medium transition-colors border",
                          numVariations === num
                            ? "bg-brand-600 text-white border-brand-600"
                            : "bg-white text-ink-700 border-paper-300 hover:bg-paper-100"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label htmlFor="apply-profile-email" className="text-xs text-ink-700 cursor-pointer">
                    Apply Personal Writing Profile:
                  </label>
                  <input
                    id="apply-profile-email"
                    type="checkbox"
                    checked={applyProfile}
                    onChange={(e) => setApplyProfile(e.target.checked)}
                    className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg bg-ink-900 hover:bg-ink-800 text-paper-50 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-subtle disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-brand-300" />
              <span>{loading ? 'Crafting Email...' : 'Generate Email Draft'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-3 rounded-lg border border-paper-300 hover:bg-paper-100 text-ink-600 text-xs transition-colors"
              title="Reset fields"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Right Column: Interactive Editor Workspace */}
        <div className="lg:col-span-7">
          {result ? (
            <EditorWorkspace
              initialSubject={result.subject}
              initialBody={result.body}
              variations={result.variations}
              modelUsed={result.model_used}
              isMock={result.is_mock}
              promptSpec={result.prompt_spec}
              taskType="email"
              format="email"
            />
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-paper-300 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-3">
              <div className="w-12 h-12 rounded-full bg-paper-100 text-ink-400 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-ink-800">
                Email Workspace Ready
              </h3>
              <p className="text-xs text-ink-500 max-w-sm leading-relaxed">
                Provide your rough purpose and key points on the left, then click Generate. 
                Your polished subject line and structured draft will appear here ready to edit, save, or export.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmailGeneratorPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-ink-400">Loading email workspace...</div>}>
      <EmailGeneratorForm />
    </Suspense>
  );
}
