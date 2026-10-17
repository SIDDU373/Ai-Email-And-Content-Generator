'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  PenLine,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { Draft } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const TEMPLATES = [
  {
    title: 'Executive Follow-Up',
    description: 'Concise, high-impact project status & next steps for leadership.',
    href: '/email?use_case=follow_up&tone=professional&length=short&purpose=Project%20milestone%20review%20and%20sign-off%20request',
    icon: Mail,
    badge: 'Email'
  },
  {
    title: 'Polite Meeting Decline',
    description: 'Graciously decline a conflict while preserving the relationship.',
    href: '/email?use_case=polite_decline&tone=friendly&length=short&purpose=Decline%20invitation%20due%20to%20prior%20commitment',
    icon: Mail,
    badge: 'Email'
  },
  {
    title: 'Cross-Channel Announcement',
    description: 'Transform a single feature release into an announcement, email, and social post.',
    href: '/content?brief=Launch%20of%20our%20new%20real-time%20collaboration%20features%20for%20enterprise%20teams',
    icon: Sparkles,
    badge: 'Multi-Format'
  },
  {
    title: 'Executive Clarity Polish',
    description: 'Cut filler, remove passive voice, and sharpen value in your text.',
    href: '/rewrite?action=improve_clarity',
    icon: RefreshCw,
    badge: 'Rewrite'
  }
];

export default function HomePage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getDrafts();
        setDrafts(res.slice(0, 5));
      } catch {
        setDrafts([]);
      } finally {
        setLoadingDrafts(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-10">
      {/* Editorial Hero */}
      <div className="border-b border-paper-300 pb-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
          Precision Editorial Workspace
        </span>
        <h1 className="editorial-title text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 mt-4 max-w-3xl leading-tight">
          Turn rough thoughts into writing that is clear, polished, and ready to send.
        </h1>
        <p className="text-ink-600 text-base sm:text-lg mt-3 max-w-2xl leading-relaxed">
          Craft high-stakes workplace emails, transform unified briefs into multi-channel content, 
          and precision-rewrite text — without repeatedly engineering complex prompts.
        </p>

        {/* Quick Launch Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
          <Link
            href="/email"
            className="group p-4 bg-white rounded-xl border border-paper-300 hover:border-brand-500 hover:ring-2 hover:ring-brand-500/10 shadow-card transition-all flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-ink-900 group-hover:text-brand-600 transition-colors flex items-center gap-1">
                <span>Write an Email</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-ink-500 mt-1">
                Requests, follow-ups, declines & scheduling with variations.
              </p>
            </div>
          </Link>

          <Link
            href="/content"
            className="group p-4 bg-white rounded-xl border border-paper-300 hover:border-brand-500 hover:ring-2 hover:ring-brand-500/10 shadow-card transition-all flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-ink-900 group-hover:text-brand-600 transition-colors flex items-center gap-1">
                <span>Create Content</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-ink-500 mt-1">
                Transform one brief into social posts, outlines, and announcements.
              </p>
            </div>
          </Link>

          <Link
            href="/rewrite"
            className="group p-4 bg-white rounded-xl border border-paper-300 hover:border-brand-500 hover:ring-2 hover:ring-brand-500/10 shadow-card transition-all flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-ink-900 group-hover:text-brand-600 transition-colors flex items-center gap-1">
                <span>Precision Rewrite</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-ink-500 mt-1">
                Clarity, grammar, shortening, and tone changes with comparison diffs.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Common Writing Scenarios */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-500">
            Common Scenarios & Quick Templates
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <Link
                key={tmpl.title}
                href={tmpl.href}
                className="p-4 bg-white rounded-xl border border-paper-300 hover:border-ink-400 shadow-subtle hover:shadow-card transition-all flex items-start justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-paper-100 text-ink-600 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink-900 group-hover:text-brand-600 transition-colors">
                        {tmpl.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-paper-100 text-ink-500">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mt-1">
                      {tmpl.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ink-600 transition-colors mt-2" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Drafts section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-500">
            Recent Drafts
          </h2>
          <Link href="/drafts" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View all drafts →
          </Link>
        </div>

        {loadingDrafts ? (
          <div className="p-8 text-center bg-white rounded-xl border border-paper-300 text-ink-400 text-xs">
            Loading your drafts...
          </div>
        ) : drafts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-paper-300 space-y-3">
            <div className="w-10 h-10 rounded-full bg-paper-100 text-ink-400 flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-ink-800">No saved drafts yet</div>
            <p className="text-xs text-ink-500 max-w-sm mx-auto">
              Drafts you generate or save from the editor will appear here automatically for easy editing and export.
            </p>
            <Link
              href="/email"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>Draft your first email</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-paper-300 shadow-card divide-y divide-paper-200 overflow-hidden">
            {drafts.map((draft) => (
              <Link
                key={draft.id}
                href={`/drafts?id=${draft.id}`}
                className="p-4 hover:bg-paper-50/70 transition-colors flex items-center justify-between group"
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-paper-100 text-ink-600">
                      {draft.format || draft.task_type}
                    </span>
                    <h3 className="text-sm font-semibold text-ink-900 truncate group-hover:text-brand-600 transition-colors">
                      {draft.title || draft.subject || 'Untitled Draft'}
                    </h3>
                  </div>
                  <p className="text-xs text-ink-500 truncate max-w-xl">
                    {draft.content.slice(0, 100)}...
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-ink-400">
                    {formatDate(draft.updated_at)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ink-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
