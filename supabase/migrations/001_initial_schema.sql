-- WriteFlow AI — Initial Supabase PostgreSQL Schema
-- Includes RLS policies, indexes, and timestamps

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    display_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Writing Preferences Table
CREATE TABLE IF NOT EXISTS public.writing_profiles (
    user_id TEXT PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT true NOT NULL,
    default_tone TEXT DEFAULT 'professional' NOT NULL,
    formality_level INTEGER DEFAULT 3 CHECK (formality_level BETWEEN 1 AND 5),
    preferred_length TEXT DEFAULT 'balanced' NOT NULL,
    vocabulary_preferences TEXT DEFAULT '',
    formatting_preferences TEXT DEFAULT '',
    words_to_avoid JSONB DEFAULT '[]'::jsonb NOT NULL,
    style_examples JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Drafts Table
CREATE TABLE IF NOT EXISTS public.drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    task_type TEXT NOT NULL DEFAULT 'email',
    format TEXT NOT NULL DEFAULT 'email',
    subject TEXT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Generation Logs (operational auditing with zero raw private text exposure)
CREATE TABLE IF NOT EXISTS public.generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    task_type TEXT NOT NULL,
    format TEXT NOT NULL,
    model_used TEXT NOT NULL,
    input_length INTEGER NOT NULL,
    output_length INTEGER NOT NULL,
    is_mock BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_drafts_user_updated ON public.drafts (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_task_type ON public.drafts (task_type);
CREATE INDEX IF NOT EXISTS idx_gen_logs_user ON public.generation_logs (user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (User isolation)
-- Note: When using Supabase Auth, auth.uid()::text matches the user_id
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view their writing profile"
    ON public.writing_profiles FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can upsert their writing profile"
    ON public.writing_profiles FOR ALL
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own drafts"
    ON public.drafts FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own drafts"
    ON public.drafts FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own drafts"
    ON public.drafts FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own drafts"
    ON public.drafts FOR DELETE
    USING (auth.uid()::text = user_id);
