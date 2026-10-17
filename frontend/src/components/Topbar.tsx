'use client';

import React, { useEffect, useState } from 'react';
import { Menu, Cpu, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { HealthStatus } from '@/lib/types';
import Link from 'next/link';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
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
    <header className="h-16 px-4 md:px-6 border-b border-paper-300 bg-paper-50 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-paper-200 lg:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs uppercase tracking-wider font-semibold text-ink-400 hidden sm:inline-block">
          AI Writing Workspace
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* LLM Status Indicator */}
        <Link 
          href="/settings"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-white hover:bg-paper-100 shadow-subtle border-paper-300"
          title="Click to view model configuration"
        >
          <Cpu className="w-3.5 h-3.5 text-brand-600" />
          {loading ? (
            <span className="text-ink-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Checking LLM...
            </span>
          ) : health?.nvidia.configured ? (
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              NVIDIA NIM: {health.nvidia.model.split('/').pop()}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Preview Mock Mode (Key Pending)
            </span>
          )}
        </Link>

        {/* User indicator */}
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-paper-200 border border-paper-300 flex items-center justify-center text-xs font-semibold text-ink-700 hover:border-ink-400 transition-colors"
          title="Writing Profile"
        >
          WF
        </Link>
      </div>
    </header>
  );
}
