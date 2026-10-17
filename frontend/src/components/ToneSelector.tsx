'use client';

import React from 'react';
import { ToneType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  Smile, 
  Zap, 
  TrendingUp, 
  Heart, 
  Award, 
  FileCheck, 
  MessageCircle 
} from 'lucide-react';

interface ToneOption {
  value: ToneType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TONES: ToneOption[] = [
  { value: 'professional', label: 'Professional', description: 'Polished & workplace-ready', icon: Briefcase },
  { value: 'friendly', label: 'Friendly', description: 'Warm & approachable', icon: Smile },
  { value: 'concise', label: 'Concise', description: 'High signal, zero filler', icon: Zap },
  { value: 'persuasive', label: 'Persuasive', description: 'Compelling with clear CTA', icon: TrendingUp },
  { value: 'empathetic', label: 'Empathetic', description: 'Considerate & understanding', icon: Heart },
  { value: 'confident', label: 'Confident', description: 'Decisive & assertive', icon: Award },
  { value: 'formal', label: 'Formal', description: 'Traditional business etiquette', icon: FileCheck },
  { value: 'conversational', label: 'Conversational', description: 'Natural speaking cadence', icon: MessageCircle },
];

interface ToneSelectorProps {
  value: ToneType;
  onChange: (tone: ToneType) => void;
  className?: string;
}

export function ToneSelector({ value, onChange, className }: ToneSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
        Tone & Voice
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TONES.map((t) => {
          const isSelected = value === t.value;
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={cn(
                "flex flex-col items-start p-2.5 rounded-lg border text-left transition-all",
                isSelected
                  ? "bg-white border-brand-600 ring-2 ring-brand-500/20 shadow-card"
                  : "bg-paper-100/60 border-paper-300 hover:bg-white hover:border-paper-400 text-ink-600"
              )}
            >
              <div className="flex items-center gap-1.5 w-full mb-1">
                <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-brand-600" : "text-ink-400")} />
                <span className={cn("text-xs font-semibold", isSelected ? "text-ink-900" : "text-ink-700")}>
                  {t.label}
                </span>
              </div>
              <span className="text-[10px] text-ink-400 line-clamp-1">
                {t.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
