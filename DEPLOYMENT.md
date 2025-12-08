# Deployment Guide

Your Weekly Reports Application is ready to be deployed! Follow one of the methods below.

## Fixed Configuration (December 2025)

The deployment configuration has been updated to correctly handle the nested project structure. The following files have been moved to the repository root:
- `vercel.json` - Configured for nested project structure
- `netlify.toml` - Configured with proper base directory

The build process has been tested and is working correctly.

## Prerequisites

Before deploying, ensure you have:
- Your Supabase database set up and running
- All environment variables ready
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables Required

You'll need to add these environment variables to your hosting platform:

```
VITE_SUPABASE_URL=https://vztyquoebiayrcggopuq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dHlxdW9lYmlheXJjZ2dvcHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMzE3NzgsImV4cCI6MjA3ODYwNzc3OH0.Lh8si04CXg5gS_qx_bZ8BnOG2AKWS4KuLr6_2EtSmBQ
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

---

## Option 1: Deploy to Vercel (Recommended - Fastest & Easiest)

The `vercel.json` configuration file is already set up in the repository root with the correct settings for the nested project structure.

### Step-by-Step:

1. **Push your code to GitHub** (if not already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "Add New Project"

3. **Import Your Repository**
   - Select your repository from the list
   - Click "Import"

4. **Configure Project Settings**
   - Vercel should auto-detect the settings from `vercel.json`
   - If needed, manually set:
     - **Build Command**: `npm --prefix project run build`
     - **Output Directory**: `project/dist`

5. **Add Environment Variables**
   - In the "Environment Variables" section, add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_OPENAI_API_KEY` (if using Reports Assistant)

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)
   - Your app will be live at `your-project.vercel.app`

### Automatic Deployments
- Every push to your main branch will automatically deploy
- Pull requests get preview deployments

---

## Option 2: Deploy to Netlify

The `netlify.toml` configuration file is already set up in the repository root with the correct settings.

### Step-by-Step:

1. **Push your code to GitHub** (if not already)

2. **Go to Netlify**
   - Visit [netlify.com](https://netlify.com)
   - Sign in with your GitHub account
   - Click "Add new site" → "Import an existing project"

3. **Connect to Git Provider**
   - Select GitHub
   - Choose your repository

4. **Configure Build Settings**
   - Netlify should auto-detect the settings from `netlify.toml`
   - The configuration is already set with:
     - **Base directory**: `project`
     - **Build command**: `npm run build`
     - **Publish directory**: `dist` (relative to base)

5. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_OPENAI_API_KEY`

6. **Deploy**
   - Click "Deploy site"
   - Your app will be live at `your-project.netlify.app`

---

## Option 3: Deploy to GitHub Pages (Free)

### Step-by-Step:

1. **Install gh-pages package**
   ```bash
   cd project
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   Add these scripts to `project/package.json`:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts**
   Add base URL:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Configure GitHub Pages**
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Your app will be live at `https://username.github.io/repo-name/`

**Note**: For GitHub Pages, you'll need to handle environment variables differently since they can't be set in GitHub Pages. Consider using a backend API or Supabase Edge Functions.

---

## Option 4: Manual Deployment to Any Static Host

If you prefer to deploy to another hosting provider:

1. **Build the project**
   ```bash
   cd project
   npm run build
   ```

2. **Upload the `dist/` folder**
   - Upload the contents of the `project/dist/` folder to your hosting provider
   - Ensure your server is configured to serve `index.html` for all routes (SPA routing)

3. **Configure Environment Variables**
   - Create a `.env.production` file or configure environment variables on your hosting platform

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Application loads correctly
- [ ] Authentication works (login/signup)
- [ ] Database connection works (reports load)
- [ ] File uploads work (Excel file upload)
- [ ] All role-based features work correctly:
  - [ ] Sales Managers can submit reports
  - [ ] Division Managers can see Priority Issues
  - [ ] BU Managers can see Top 5 Deals
  - [ ] Admins can manage users and data

---

## Troubleshooting

### Build Fails
- Check that all dependencies are installed
- Ensure Node.js version is 18 or higher
- Verify environment variables are set correctly

### Database Connection Issues
- Verify Supabase URL and API key are correct
- Check Supabase project is running
- Review Row Level Security policies in Supabase

### Routing Issues (404 on refresh)
- Ensure your hosting platform has proper SPA routing configured
- Vercel/Netlify handle this automatically
- For other hosts, configure server to serve `index.html` for all routes

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Check Supabase dashboard for database issues
4. Review deployment logs on your hosting platform

---

## Security Notes

- Never commit `.env` files to Git
- Keep your Supabase keys secure
- Use Row Level Security policies in Supabase
- Regularly rotate API keys
- Monitor your application logs for suspicious activity
