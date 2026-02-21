# Deployment Guide: Netlify

This guide will walk you through deploying your Rota Web App to Netlify. Netlify is an excellent choice for Next.js applications, offering a free tier that supports commercial use (unlike Vercel's hobby tier).

## Prerequisites

1.  **GitHub Account:** You'll need a GitHub account to store your code.
2.  **Netlify Account:** Create a free account at [https://app.netlify.com/signup](https://app.netlify.com/signup).

## Step 1: Push Your Code to GitHub

Make sure your latest code is pushed to your GitHub repository.

1.  Open your terminal.
2.  Navigate to your project directory.
3.  Add, commit, and push your changes:
    ```bash
    git add .
    git commit -m "Prepare for deployment"
    git push origin main
    ```

## Step 2: Connect Netlify to GitHub

1.  Log in to your [Netlify Dashboard](https://app.netlify.com/).
2.  Click on the **"Add new site"** button and select **"Import an existing project"**.
3.  Select **GitHub** as your Git provider.
4.  Authorize Netlify to access your repositories if prompted.
5.  Search for and select your **rota-web-app** repository.

## Step 3: Configure Build Settings

Netlify should automatically detect that this is a Next.js project. Thanks to the `netlify.toml` file we added, the settings should be pre-filled correctly.

### Environment Variables

You need to set the following environment variables for the application to function correctly (e.g., Google Analytics).

1.  Click on **"Advanced build settings"** (or go to **"Site settings" > "Environment variables"** after the site is created).
2.  Add a new variable:
    *   **Key:** `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`
    *   **Value:** `G-6D16KGXXT5`

Verify the following:

*   **Build command:** `npm run build`
*   **Publish directory:** `.next`
*   **Base directory:** (Leave empty or `/` unless your app is in a subdirectory)

If everything looks correct, click **"Deploy site"**.

## Step 4: Verify Deployment

1.  Netlify will start building your site. You can watch the build logs in real-time.
2.  Once the build is complete (usually 1-2 minutes), you will see a green **"Published"** status.
3.  Click on the generated URL (e.g., `https://random-name-12345.netlify.app`) to view your live app.

## Step 5: (Optional) Custom Domain

1.  Go to **"Domain settings"** in your site dashboard.
2.  Click **"Add custom domain"**.
3.  Enter your domain name (e.g., `www.my-rota-game.com`) and follow the instructions to update your DNS settings.

## Troubleshooting

### Build Failures
If the build fails, check the "Deploy log" for error messages. Common issues include:
*   **Missing Dependencies:** Ensure `package.json` lists all required packages.
*   **Linting Errors:** Fix any ESLint errors locally by running `npm run lint`.
*   **Type Errors:** Fix TypeScript errors by running `npx tsc --noEmit`.

### Next.js Runtime
Netlify uses the Essential Next.js plugin to run Next.js features like API routes and ISR. This is usually installed automatically. If you see runtime errors, ensure you are not using experimental Next.js features that might not be fully supported yet.

---

**Congratulations! Your Rota game is now live!**
