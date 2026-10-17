import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'WriteFlow AI — Executive Email & Content Workspace',
  description: 'AI-powered writing workspace for emails, announcements, articles, and precision rewrites powered by NVIDIA NIM.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-paper-50 text-ink-900 antialiased min-h-screen">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
