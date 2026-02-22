# Supabase Setup Guide (2026)

## 1. Verify Your Project Credentials
Supabase has introduced new API keys, but the classic "anon" key still works for public access.

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project ("rota-game").
3.  Go to **Project Settings** -> **API**.
4.  Find the **Project URL**:
    -   It should look like: `https://<your-project-ref>.supabase.co`
    -   Copy this to `NEXT_PUBLIC_SUPABASE_URL` in your `.env.local` file.
5.  Find the **Project API keys**:
    -   Look for the `anon` / `public` key.
    -   OR look for the new `sb_publishable_...` key if available.
    -   Copy this to `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` file.

**Do NOT use the `service_role` or `sb_secret_...` key in your frontend code!**

## 2. Test Your Connection
We have added a debug page to help you verify your setup.

1.  Start your development server: `npm run dev`
2.  Navigate to `http://localhost:3000/debug`
3.  If the connection is successful, you will see a green "SUCCESS" message.
4.  If it fails, check the console (F12) for detailed error messages.

## 3. Common Issues
-   **Invalid URL:** Ensure the URL starts with `https://` and does not have trailing slashes or spaces.
-   **Wrong Key:** Ensure you are using the `anon` / `public` key, not the secret one.
-   **RLS Policies:** If you are using a database table, ensure Row Level Security (RLS) policies allow access. (Note: This game uses Realtime Channels which are ephemeral and do not require table access by default, but if you enabled restrictions, check them).
