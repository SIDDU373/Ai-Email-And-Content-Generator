'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Cpu, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
import { api } from '@/lib/api';
import { HealthStatus } from '@/lib/types';

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getHealth();
      setHealth(res);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
          <Settings2 className="w-4 h-4" />
          <span>System & Architecture</span>
        </div>
        <h1 className="editorial-title text-2xl sm:text-3xl font-bold text-ink-900 mt-1">
          NVIDIA LLM & Environment Settings
        </h1>
        <p className="text-xs sm:text-sm text-ink-500 mt-1 max-w-2xl">
          WriteFlow AI uses hosted NVIDIA NIM LLMs as its authoritative generation engine. 
          Manage your connection, model selections, and local persistence.
        </p>
      </div>

      {/* Provider Status Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-paper-300 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-paper-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-900">
                NVIDIA Hosted LLM Provider
              </h3>
              <p className="text-xs text-ink-500">
                OpenAI-compatible inference via <code className="bg-paper-100 px-1 py-0.5 rounded font-mono text-[11px]">integrate.api.nvidia.com</code>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 rounded-lg border border-paper-300 hover:bg-paper-100 text-ink-600 text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-paper-50 border border-paper-200 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Connection Status
            </span>
            <div className="flex items-center gap-2">
              {health?.nvidia.configured ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>NVIDIA API Key Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Preview Mock Mode (Key Not Set)</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-ink-500 pt-1">
              {health?.nvidia.configured 
                ? 'Direct high-speed inference with live NVIDIA endpoints.' 
                : 'Local mock generator enabled so you can test all workflows offline.'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-paper-50 border border-paper-200 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Selected LLM Model
            </span>
            <div className="text-xs font-mono font-bold text-brand-800">
              {health?.nvidia.model || 'meta/llama-3.3-70b-instruct'}
            </div>
            <p className="text-[11px] text-ink-500 pt-1">
              Configured via <code className="bg-paper-200 px-1 py-0.5 rounded font-mono text-[10px]">NVIDIA_MODEL</code>
            </p>
          </div>
        </div>

        {/* Recommended Models Catalog */}
        <div className="p-5 rounded-lg bg-paper-50 border border-paper-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-800 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-brand-600" />
            <span>Recommended NVIDIA Free-Tier NIM Models</span>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-white border border-paper-300 flex items-start justify-between gap-3 shadow-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink-900">Nemotron 3.5 Lightning 30B</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">Recommended</span>
                </div>
                <p className="text-[11px] text-ink-500 mt-0.5">Ultra-low latency, optimized for workplace email and precision rewriting.</p>
                <code className="text-[11px] font-mono text-brand-700 select-all">nvidia/nemotron-3.5-lightning-30b-a3b</code>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-paper-300 flex items-start justify-between gap-3 shadow-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink-900">Llama 3.1 Nemotron 70B</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-bold">High Reasoning</span>
                </div>
                <p className="text-[11px] text-ink-500 mt-0.5">Deep reasoning and comprehensive instruction following.</p>
                <code className="text-[11px] font-mono text-brand-700 select-all">nvidia/llama-3.1-nemotron-70b-instruct</code>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-paper-300 flex items-start justify-between gap-3 shadow-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink-900">Llama 3.3 70B Instruct</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-paper-100 text-ink-600 font-bold">Frontier</span>
                </div>
                <p className="text-[11px] text-ink-500 mt-0.5">Leading open weights model for complex editorial outlines.</p>
                <code className="text-[11px] font-mono text-brand-700 select-all">meta/llama-3.3-70b-instruct</code>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions to configure NVIDIA key */}
        <div className="p-4 rounded-lg bg-paper-100/70 border border-paper-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-800">
            <Key className="w-4 h-4 text-brand-600" />
            <span>How to Connect Your Real NVIDIA API Key</span>
          </div>
          <ol className="list-decimal list-inside text-xs text-ink-600 space-y-1.5 leading-relaxed">
            <li>
              Obtain your free API key from <a href="https://build.nvidia.com" target="_blank" rel="noreferrer" className="text-brand-600 font-semibold underline inline-flex items-center gap-0.5">build.nvidia.com <ExternalLink className="w-3 h-3" /></a>.
            </li>
            <li>
              Open or create <code className="font-mono bg-paper-200 px-1 py-0.5 rounded text-[11px]">backend/.env</code> in your project.
            </li>
            <li>
              Paste: <code className="font-mono bg-paper-200 px-1 py-0.5 rounded text-[11px]">NVIDIA_API_KEY=nvapi-...</code>
            </li>
            <li>
              Optional: Set <code className="font-mono bg-paper-200 px-1 py-0.5 rounded text-[11px]">NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b</code>
            </li>
            <li>
              Save the file. The backend will automatically recognize your key and switch immediately to live NVIDIA Nemotron inference!
            </li>
          </ol>
        </div>

        {/* Database & Persistence Info */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-800 uppercase tracking-wider">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Database & Storage Architecture</span>
          </div>
          <p className="text-xs text-ink-600 leading-relaxed">
            WriteFlow stores drafts and user preferences locally using SQLite (<code className="font-mono bg-paper-100 px-1 py-0.5 rounded text-[11px]">writeflow.db</code>) with full schema parity for Supabase PostgreSQL.
            Ready-to-use Supabase migrations with Row-Level Security (RLS) policies are available at <code className="font-mono bg-paper-100 px-1 py-0.5 rounded text-[11px]">supabase/migrations/001_initial_schema.sql</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
