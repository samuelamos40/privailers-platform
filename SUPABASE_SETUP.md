# Supabase Setup Guide

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or Email

## Step 2: Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `privailers-platform` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Select "Free" for development
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be provisioned

## Step 3: Get Your API Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)
4. Copy these values - you'll need them in the next step

## Step 4: Configure Environment Variables

1. Open the file `.env.local` in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

## Step 5: Set Up the Database Schema

1. In your Supabase dashboard, click on the **SQL Editor** icon in the left sidebar
2. Click "New query"
3. Open the file `supabase-schema.sql` from your project root
4. Copy ALL the contents of that file
5. Paste it into the Supabase SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. You should see "Success. No rows returned" - this means all tables were created!

## Step 6: Seed the Database with Sample Data

1. Still in the SQL Editor, click "New query" again
2. Open the file `supabase-seed.sql` from your project root
3. Copy ALL the contents
4. Paste it into the SQL Editor
5. Click "Run"
6. You should see confirmation that sample courses, modules, and leads were inserted

## Step 7: Create Test Users

Since we're using Supabase Auth, we need to create users through the authentication system:

### Create a Student User

1. In Supabase dashboard, click on **Authentication** in the left sidebar
2. Click on **Users** tab
3. Click "Add user" → "Create new user"
4. Fill in:
   - **Email**: `student@privailers.com`
   - **Password**: `student123`
   - **Auto Confirm User**: ✅ (check this box)
5. Click "Create user"
6. **Copy the User ID** (UUID) that appears

### Link Student to Database

1. Go back to **SQL Editor**
2. Run this query (replace `USER_ID_HERE` with the actual UUID you copied):

```sql
INSERT INTO users (id, email, full_name, role)
VALUES ('84036e32-10b4-4bca-8adb-ce5063b5d47f', 'samuelsamos911@gmail.com', 'Samuel Amos', 'student');

-- Enroll the student in a course
INSERT INTO enrollments (user_id, course_id, progress, status)
VALUES ('84036e32-10b4-4bca-8adb-ce5063b5d47f', '11111111-1111-1111-1111-111111111111', 35, 'active');
```

### Create an Admin User

1. Go back to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Fill in:
   - **Email**: `admin@privailers.com`
   - **Password**: `admin123`
   - **Auto Confirm User**: ✅
4. Click "Create user"
5. **Copy the User ID**

### Link Admin to Database

1. Go to **SQL Editor**
2. Run this query (replace `ADMIN_USER_ID_HERE` with the actual UUID):

```sql
INSERT INTO users (id, email, full_name, role)
VALUES ('17a79dc2-3daf-4471-9420-ab3d2b6d9d64', 'samuelamos419@gmail.com', 'Sunday Amos', 'admin');
```

## Step 8: Restart Your Development Server

1. Stop your current `npm run dev` server (Ctrl+C)
2. Start it again: `npm run dev`
3. This ensures the new environment variables are loaded

## Step 9: Test the Application

1. Open your browser to `http://localhost:3000`
2. Click "Student Login" in the navigation
3. Log in with:
   - Email: `student@privailers.com`
   - Password: `student123`
4. You should see the student dashboard with real data!

5. Log out and try the admin login:
   - Go to `http://localhost:3000/admin-login`
   - Email: `admin@privailers.com`
   - Password: `admin123`

## Troubleshooting

### "Invalid API credentials"
- Double-check that you copied the correct URL and anon key
- Make sure there are no extra spaces in `.env.local`
- Restart your dev server after changing `.env.local`

### "User not found" or login fails
- Make sure you created the user in Supabase Auth
- Verify you ran the SQL query to insert the user into the `users` table
- Check that the UUID matches between Auth and the database

### "No data showing"
- Verify you ran both `supabase-schema.sql` AND `supabase-seed.sql`
- Check the Supabase Table Editor to see if data exists
- Open browser console (F12) to check for errors

## Next Steps

Once everything is working:
- You can add more courses and modules through the Supabase Table Editor
- Create more student accounts for testing
- Customize the Row Level Security policies if needed
- Set up Supabase Storage for file uploads (projects)

## Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Check the Supabase logs in the dashboard
3. Verify all SQL queries ran successfully
4. Make sure your `.env.local` file is not committed to git (it's in `.gitignore`)
