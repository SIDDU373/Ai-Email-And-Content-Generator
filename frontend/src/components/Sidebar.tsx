'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Mail, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Sliders, 
  LayoutDashboard, 
  Settings2,
  PenSquare,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Home & Recent', href: '/', icon: LayoutDashboard },
  { name: 'Write Email', href: '/email', icon: Mail, badge: 'P0' },
  { name: 'Multi-Format Content', href: '/content', icon: Sparkles, badge: 'P0' },
  { name: 'Rewrite & Improve', href: '/rewrite', icon: RefreshCw, badge: 'P0' },
  { name: 'Saved Drafts', href: '/drafts', icon: FileText },
  { name: 'Writing Profile', href: '/profile', icon: Sliders, badge: 'Profile' },
  { name: 'API & Settings', href: '/settings', icon: Settings2 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-40 w-64 bg-paper-100 border-r border-paper-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-paper-300 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ink-900 text-paper-50 flex items-center justify-center font-serif text-lg font-bold shadow-subtle">
              W
            </div>
            <div>
              <span className="font-serif font-bold text-ink-900 text-lg tracking-tight">WriteFlow</span>
              <span className="text-[11px] font-sans font-medium text-brand-600 ml-1.5 px-1.5 py-0.5 rounded bg-brand-50 border border-brand-200">AI</span>
            </div>
          </Link>
        </div>

        {/* Quick action button */}
        <div className="p-3">
          <Link
            href="/email"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-ink-900 text-paper-50 hover:bg-ink-800 text-sm font-medium transition-colors shadow-subtle group"
          >
            <PenSquare className="w-4 h-4 text-paper-300 group-hover:text-paper-100 transition-colors" />
            <span>New Draft</span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-white text-ink-900 shadow-card font-semibold border border-paper-200" 
                    : "text-ink-600 hover:text-ink-900 hover:bg-paper-200/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-brand-600" : "text-ink-400 group-hover:text-ink-700"
                  )} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded",
                    isActive ? "bg-brand-50 text-brand-700 font-bold" : "bg-paper-200 text-ink-500"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-paper-300 text-xs text-ink-500 space-y-2 bg-paper-50/50">
          <div className="flex items-center gap-2 text-ink-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Private & Ephemeral</span>
          </div>
          <p className="text-[11px] text-ink-400 leading-relaxed">
            Drafts stay in your local environment. Zero model training on private texts.
          </p>
        </div>
      </aside>
    </>
  );
}
