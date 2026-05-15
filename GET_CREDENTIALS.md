# Quick Guide: Get Your Real Supabase Credentials

## The Problem
You're seeing "Failed to fetch" because the `.env.local` file has placeholder credentials that don't connect to a real Supabase database.

## Solution: Get Your Real Credentials

### Step 1: Open Your Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Click on your project (the one you created earlier)

### Step 2: Get Your Project URL
1. In the left sidebar, click **"Project Settings"** (gear icon at bottom)
2. Click **"API"** in the settings menu
3. Look for **"Project URL"** section
4. Copy the URL - it looks like: `https://xxxxxxxxxxxxx.supabase.co`

### Step 3: Get Your Anon Key
1. Still on the same API settings page
2. Scroll down to **"Project API keys"**
3. Find the **"anon public"** key
4. Click the copy icon to copy it
5. It's a long string starting with `eyJ...`

### Step 4: Update Your .env.local File
1. Open `.env.local` in your project folder
2. Replace the placeholder values with your real credentials:

```env
# Environment Variables
# IMPORTANT: Replace these with your actual Supabase credentials
# Follow the SUPABASE_SETUP.md guide to get your real values

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_KEY_HERE
```

### Step 5: Restart Your Dev Server
After updating `.env.local`:

1. **Stop the current server**: Press `Ctrl+C` in the terminal running `npm run dev`
2. **Start it again**: Run `npm run dev`
3. **Try registration again**: Go to `http://localhost:3000/register`

## Visual Guide

Here's exactly where to find your credentials in Supabase:

```
Supabase Dashboard
├── Your Project
    └── Settings (gear icon)
        └── API
            ├── Project URL: https://xxxxx.supabase.co  ← Copy this
            └── Project API keys
                └── anon public: eyJhbGci...  ← Copy this
```

## Common Issues

### "Still getting Failed to fetch"
- Make sure you saved the `.env.local` file
- Make sure you restarted the dev server (Ctrl+C then `npm run dev`)
- Check there are no extra spaces in the credentials

### "Can't find my project"
- Make sure you're logged into the correct Supabase account
- If you haven't created a project yet, create one at [https://supabase.com/dashboard](https://supabase.com/dashboard)

### "My credentials look different"
- That's okay! Just copy exactly what you see in your dashboard
- The format should be:
  - URL: `https://something.supabase.co`
  - Key: Long string starting with `eyJ`

## Need to Create a New Project?

If you haven't created a Supabase project yet:

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: Privailers Platform
   - **Database Password**: (choose a strong password and save it)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup
6. Then follow Steps 1-5 above to get your credentials
