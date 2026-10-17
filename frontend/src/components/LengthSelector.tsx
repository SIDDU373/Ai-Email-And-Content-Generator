'use client';

import React from 'react';
import { LengthType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlignLeft, AlignJustify, FileText } from 'lucide-react';

interface LengthOption {
  value: LengthType;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

const LENGTHS: LengthOption[] = [
  { value: 'short', label: 'Short', detail: '< 100 words', icon: AlignLeft },
  { value: 'balanced', label: 'Balanced', detail: '120 - 250 words', icon: AlignJustify },
  { value: 'detailed', label: 'Detailed', detail: '250 - 500 words', icon: FileText },
];

interface LengthSelectorProps {
  value: LengthType;
  onChange: (length: LengthType) => void;
  className?: string;
}

export function LengthSelector({ value, onChange, className }: LengthSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
        Desired Length
      </label>
      <div className="grid grid-cols-3 gap-2">
        {LENGTHS.map((item) => {
          const isSelected = value === item.value;
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all",
                isSelected
                  ? "bg-white border-brand-600 ring-2 ring-brand-500/20 shadow-card"
                  : "bg-paper-100/60 border-paper-300 hover:bg-white hover:border-paper-400 text-ink-600"
              )}
            >
              <Icon className={cn("w-4 h-4", isSelected ? "text-brand-600" : "text-ink-400")} />
              <div>
                <div className={cn("text-xs font-semibold", isSelected ? "text-ink-900" : "text-ink-700")}>
                  {item.label}
                </div>
                <div className="text-[10px] text-ink-400">{item.detail}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
