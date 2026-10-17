'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Trash2, 
  Copy, 
  Download, 
  Search, 
  Check, 
  ExternalLink,
  ChevronRight,
  Clock,
  Edit3,
  Bookmark
} from 'lucide-react';
import { api } from '@/lib/api';
import { Draft } from '@/lib/types';
import { formatDate, countWords, copyToClipboard, downloadFile } from '@/lib/utils';
import Link from 'next/link';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

  // Edit states for selected draft
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const res = await api.getDrafts();
      setDrafts(res);
      if (res.length > 0 && !selectedDraft) {
        setSelectedDraft(res[0]);
        setEditTitle(res[0].title);
        setEditContent(res[0].content);
      }
    } catch {
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleSelectDraft = (d: Draft) => {
    setSelectedDraft(d);
    setEditTitle(d.title);
    setEditContent(d.content);
    setEditSuccess(false);
  };

  const handleSaveUpdate = async () => {
    if (!selectedDraft) return;
    try {
      setSavingEdit(true);
      const updated = await api.updateDraft(selectedDraft.id, {
        title: editTitle,
        content: editContent,
      });
      setSelectedDraft(updated);
      setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 2500);
    } catch {
      //
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) return;
    try {
      await api.deleteDraft(id);
      const remaining = drafts.filter((d) => d.id !== id);
      setDrafts(remaining);
      if (selectedDraft?.id === id) {
        if (remaining.length > 0) {
          handleSelectDraft(remaining[0]);
        } else {
          setSelectedDraft(null);
        }
      }
    } catch {
      //
    }
  };

  const handleCopy = async () => {
    if (!selectedDraft) return;
    const text = editContent || selectedDraft.content;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = (fmt: 'markdown' | 'text') => {
    if (!selectedDraft) return;
    const filename = `${selectedDraft.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fmt === 'markdown' ? 'md' : 'txt'}`;
    downloadFile(editContent || selectedDraft.content, filename, fmt === 'markdown' ? 'text/markdown' : 'text/plain');
  };

  const filteredDrafts = drafts.filter((d) => {
    const matchesSearch = 
      d.title.toLowerCase().includes(search.toLowerCase()) || 
      d.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || d.task_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
          <Bookmark className="w-4 h-4" />
          <span>P1 Persistent Drafts</span>
        </div>
        <h1 className="editorial-title text-2xl sm:text-3xl font-bold text-ink-900 mt-1">
          Draft History & Workspace
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1 max-w-2xl">
          Review, edit, rename, and export your saved emails and articles. Isolated safely per user.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Drafts List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & filter */}
          <div className="bg-white p-4 rounded-xl border border-paper-300 shadow-card space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search drafts..."
                className="w-full text-xs bg-paper-50 border border-paper-300 rounded-lg pl-9 pr-3 py-2 text-ink-900 outline-none focus:bg-white focus:border-brand-500"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['all', 'email', 'content', 'rewrite'].map((filterVal) => (
                <button
                  key={filterVal}
                  type="button"
                  onClick={() => setTypeFilter(filterVal)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                    typeFilter === filterVal
                      ? 'bg-ink-900 text-white'
                      : 'bg-paper-100 text-ink-600 hover:bg-paper-200'
                  }`}
                >
                  {filterVal}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl border border-paper-300 shadow-card divide-y divide-paper-200 overflow-hidden max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-ink-400">Loading drafts...</div>
            ) : filteredDrafts.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-400 space-y-2">
                <div>No drafts match your filter.</div>
              </div>
            ) : (
              filteredDrafts.map((d) => {
                const isSelected = selectedDraft?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDraft(d)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                      isSelected ? 'bg-brand-50/50 border-l-4 border-l-brand-600' : 'hover:bg-paper-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-paper-200 text-ink-600">
                          {d.format || d.task_type}
                        </span>
                        <h4 className="text-xs font-bold text-ink-900 truncate">
                          {d.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-ink-500 line-clamp-2">
                        {d.content}
                      </p>
                      <div className="text-[10px] text-ink-400 pt-0.5">
                        {formatDate(d.updated_at)} • {countWords(d.content)} words
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Draft Editor & Actions */}
        <div className="lg:col-span-7">
          {selectedDraft ? (
            <div className="bg-white rounded-xl border border-paper-300 shadow-card flex flex-col overflow-hidden">
              {/* Header with actions */}
              <div className="px-5 py-3 border-b border-paper-200 bg-paper-50 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-ink-400 uppercase">
                  Draft ID: {selectedDraft.id.slice(0, 8)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-paper-300 text-ink-700 hover:bg-paper-100 flex items-center gap-1 shadow-subtle"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-500" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExport('markdown')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-paper-300 text-ink-700 hover:bg-paper-100 flex items-center gap-1 shadow-subtle"
                  >
                    <Download className="w-3.5 h-3.5 text-ink-500" />
                    <span>Export</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedDraft.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Editable Title */}
              <div className="px-5 py-3 border-b border-paper-200">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-400 mb-1">
                  Draft Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-sm font-semibold text-ink-900 bg-transparent border-none outline-none focus:ring-0"
                />
              </div>

              {/* Editable Body */}
              <div className="p-5 flex-1 min-h-[320px]">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={14}
                  className="w-full flex-1 resize-none bg-transparent border-none outline-none focus:ring-0 text-ink-800 leading-relaxed text-sm font-sans"
                />
              </div>

              {/* Footer with Save changes button */}
              <div className="px-5 py-3 border-t border-paper-200 bg-paper-50 flex items-center justify-between text-xs text-ink-500">
                <div className="flex items-center gap-2">
                  <span>{countWords(editContent)} words</span>
                  {editSuccess && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Changes saved
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveUpdate}
                  disabled={savingEdit}
                  className="px-4 py-1.5 rounded-lg bg-ink-900 hover:bg-ink-800 text-paper-50 font-medium text-xs flex items-center gap-1.5 transition-colors shadow-subtle disabled:opacity-50"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{savingEdit ? 'Saving...' : 'Update Draft'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-paper-300 p-12 text-center text-xs text-ink-400">
              Select a draft from the list to view or edit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
