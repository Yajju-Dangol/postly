-- PostgreSQL Supabase Schema for Postly

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

--------------------------------------------------
-- 1. Table: businesses
-- Stores branding guidelines, logos, colors, etc.
--------------------------------------------------
create table if not exists public.businesses (
    user_id uuid references auth.users(id) on delete cascade not null,
    name text,
    tagline text,
    industry text,
    tone text,
    colors text[] default array[]::text[],
    base_prompt text,
    description text,
    logo_url text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    constraint businesses_pkey primary key (user_id)
);

-- Enable Row Level Security (RLS)
alter table public.businesses enable row level security;

-- RLS Policies for businesses
create policy "Users can view their own business details"
    on public.businesses for select
    using (auth.uid() = user_id);

create policy "Users can insert/update their own business details"
    on public.businesses for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);


--------------------------------------------------
-- 2. Table: automated_posts
-- Stores automated schedule queue for posts
--------------------------------------------------
create table if not exists public.automated_posts (
    id uuid default gen_random_uuid() not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    text text not null,
    scheduled_for timestamp with time zone not null,
    status text default 'ready_to_schedule'::text not null,
    media_url text,
    channel_ids text[] default array[]::text[],
    buffer_post_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,

    constraint automated_posts_pkey primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.automated_posts enable row level security;

-- RLS Policies for automated_posts
create policy "Users can view their own scheduled posts"
    on public.automated_posts for select
    using (auth.uid() = user_id);

create policy "Users can insert their own scheduled posts"
    on public.automated_posts for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own scheduled posts"
    on public.automated_posts for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own scheduled posts"
    on public.automated_posts for delete
    using (auth.uid() = user_id);


--------------------------------------------------
-- 3. Table: error_logs
-- Stores system/buffer posting failures
--------------------------------------------------
create table if not exists public.error_logs (
    id uuid default gen_random_uuid() not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    summary text not null,
    details text,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null,

    constraint error_logs_pkey primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.error_logs enable row level security;

-- RLS Policies for error_logs
create policy "Users can view their own error logs"
    on public.error_logs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on public.error_logs for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own error logs"
    on public.error_logs for delete
    using (auth.uid() = user_id);
