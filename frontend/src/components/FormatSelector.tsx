'use client';

import React from 'react';
import { ContentFormatType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Mail, Share2, FileCode, Megaphone, MessageSquare } from 'lucide-react';

interface FormatOption {
  value: ContentFormatType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const FORMATS: FormatOption[] = [
  { value: 'email', label: 'Email', icon: Mail, description: 'Subject, greeting & CTA' },
  { value: 'social_post', label: 'Social Post', icon: Share2, description: 'Hook, insights & hashtags' },
  { value: 'blog_outline', label: 'Blog Outline', icon: FileCode, description: 'Thesis, headings & points' },
  { value: 'announcement', label: 'Announcement', icon: Megaphone, description: 'Executive summary & next steps' },
  { value: 'short_message', label: 'Short Message', icon: MessageSquare, description: 'Direct 40-60 words for chat' },
];

interface FormatSelectorProps {
  selected: ContentFormatType[];
  onChange: (formats: ContentFormatType[]) => void;
  className?: string;
}

export function FormatSelector({ selected, onChange, className }: FormatSelectorProps) {
  const toggle = (val: ContentFormatType) => {
    if (selected.includes(val)) {
      if (selected.length > 1) {
        onChange(selected.filter((item) => item !== val));
      }
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
          Target Output Formats
        </label>
        <span className="text-[11px] text-ink-400">
          Select one or multiple formats
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {FORMATS.map((fmt) => {
          const isSelected = selected.includes(fmt.value);
          const Icon = fmt.icon;
          return (
            <button
              key={fmt.value}
              type="button"
              onClick={() => toggle(fmt.value)}
              className={cn(
                "flex flex-col items-start p-3 rounded-lg border text-left transition-all",
                isSelected
                  ? "bg-white border-brand-600 ring-2 ring-brand-500/20 shadow-card"
                  : "bg-paper-100/60 border-paper-300 hover:bg-white hover:border-paper-400 text-ink-600"
              )}
            >
              <div className="flex items-center gap-1.5 w-full mb-1">
                <Icon className={cn("w-4 h-4", isSelected ? "text-brand-600" : "text-ink-400")} />
                <span className={cn("text-xs font-semibold", isSelected ? "text-ink-900" : "text-ink-700")}>
                  {fmt.label}
                </span>
              </div>
              <span className="text-[10px] text-ink-400 line-clamp-1">
                {fmt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
