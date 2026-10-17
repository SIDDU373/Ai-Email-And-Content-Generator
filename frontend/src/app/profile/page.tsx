'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  Check, 
  AlertCircle, 
  Plus, 
  X, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '@/lib/api';
import { WritingProfile } from '@/lib/types';
import { ToneSelector } from '@/components/ToneSelector';

export default function ProfilePage() {
  const [profile, setProfile] = useState<WritingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Avoid word input
  const [newAvoidWord, setNewAvoidWord] = useState('');
  // Example input
  const [newExample, setNewExample] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      setError(null);
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      setSuccessMessage('Writing profile preferences successfully updated.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const addAvoidWord = () => {
    if (!newAvoidWord.trim() || !profile) return;
    const word = newAvoidWord.trim();
    if (!profile.words_to_avoid.includes(word)) {
      setProfile({
        ...profile,
        words_to_avoid: [...profile.words_to_avoid, word]
      });
    }
    setNewAvoidWord('');
  };

  const removeAvoidWord = (wordToRemove: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      words_to_avoid: profile.words_to_avoid.filter((w) => w !== wordToRemove)
    });
  };

  const addStyleExample = () => {
    if (!newExample.trim() || !profile) return;
    setProfile({
      ...profile,
      style_examples: [...profile.style_examples, newExample.trim()]
    });
    setNewExample('');
  };

  const removeStyleExample = (idx: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      style_examples: profile.style_examples.filter((_, i) => i !== idx)
    });
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-ink-400">Loading writing profile...</div>;
  }

  if (!profile) {
    return <div className="p-12 text-center text-xs text-rose-600">Could not initialize profile.</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
          <Sliders className="w-4 h-4" />
          <span>P1 Personalization System</span>
        </div>
        <h1 className="editorial-title text-2xl sm:text-3xl font-bold text-ink-900 mt-1">
          Personal Writing Profile
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1 max-w-2xl">
          Customize WriteFlow's default tone, formality level, and vocabulary to reflect your personal voice. 
          Personalization can be toggled on or off at any time.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-paper-300 shadow-card">
        {/* Master Toggle */}
        <div className="flex items-center justify-between pb-6 border-b border-paper-200">
          <div>
            <span className="text-sm font-bold text-ink-900">Enable Profile Personalization</span>
            <p className="text-xs text-ink-500 mt-0.5">
              When enabled, your preferences will quietly guide generation without needing repetitive prompts.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={profile.is_enabled}
              onChange={(e) => setProfile({ ...profile, is_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-paper-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-paper-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
          </label>
        </div>

        {/* Default Tone */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
            Baseline Preferred Tone
          </label>
          <select
            value={profile.default_tone}
            onChange={(e) => setProfile({ ...profile, default_tone: e.target.value })}
            className="w-full text-xs font-medium text-ink-800 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none transition-colors"
          >
            {['professional', 'friendly', 'concise', 'persuasive', 'empathetic', 'confident', 'formal', 'conversational'].map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Formality Level Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
              Formality Level (1 = Casual, 5 = Very Formal)
            </label>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Level {profile.formality_level} of 5
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={profile.formality_level}
            onChange={(e) => setProfile({ ...profile, formality_level: parseInt(e.target.value) })}
            className="w-full h-2 bg-paper-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-[10px] text-ink-400">
            <span>1: Relaxed & Casual</span>
            <span>3: Standard Business</span>
            <span>5: Strict Traditional Etiquette</span>
          </div>
        </div>

        {/* Vocabulary & Formatting Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-700">
              Vocabulary Preferences
            </label>
            <input
              type="text"
              value={profile.vocabulary_preferences}
              onChange={(e) => setProfile({ ...profile, vocabulary_preferences: e.target.value })}
              placeholder="e.g. Direct, high signal, executive clarity"
              className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-700">
              Formatting Preferences
            </label>
            <input
              type="text"
              value={profile.formatting_preferences}
              onChange={(e) => setProfile({ ...profile, formatting_preferences: e.target.value })}
              placeholder="e.g. Prefer short bullet points; avoid large blocks of text"
              className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        {/* Words / Expressions to Avoid */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
            Words or Clichés to Strictly Avoid
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAvoidWord}
              onChange={(e) => setNewAvoidWord(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAvoidWord(); } }}
              placeholder="e.g. Delve, Synergy, Circle back, Touch base..."
              className="flex-1 text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none"
            />
            <button
              type="button"
              onClick={addAvoidWord}
              className="px-3.5 py-2 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.words_to_avoid.map((w) => (
              <span
                key={w}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-rose-50 text-rose-800 border border-rose-200"
              >
                <span>{w}</span>
                <button
                  type="button"
                  onClick={() => removeAvoidWord(w)}
                  className="hover:text-rose-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {profile.words_to_avoid.length === 0 && (
              <span className="text-xs text-ink-400 italic">No blocked words yet.</span>
            )}
          </div>
        </div>

        {/* Sample Writing Excerpts */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
            Sample Writing Excerpts (Optional Stylistic Reference)
          </label>
          <div className="space-y-2">
            <textarea
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              rows={2}
              placeholder="Paste a 1-2 sentence excerpt of your own writing to give the model a stylistic baseline..."
              className="w-full text-xs text-ink-900 bg-paper-50 border border-paper-300 rounded-lg p-2.5 focus:bg-white focus:border-brand-500 outline-none font-sans"
            />
            <button
              type="button"
              onClick={addStyleExample}
              className="px-3 py-1.5 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Save Sample Excerpt</span>
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {profile.style_examples.map((ex, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-paper-50 border border-paper-200 text-xs text-ink-700 flex items-start justify-between gap-3 font-serif italic"
              >
                <span>"{ex}"</span>
                <button
                  type="button"
                  onClick={() => removeStyleExample(i)}
                  className="text-ink-400 hover:text-ink-700 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Save button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-6 rounded-lg bg-ink-900 hover:bg-ink-800 text-paper-50 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-subtle disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-brand-300" />
            <span>{saving ? 'Saving...' : 'Save Writing Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
