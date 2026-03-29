# BlueCo — Skilled Trades Job Platform

A web application that connects skilled trade workers (electricians, plumbers, welders, carpenters, masons, HVAC technicians, and others) with employers across Rwanda.

## Tech Stack

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS v4, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Routing:** React Router v7

---

## Prerequisites

Make sure the following are installed on your machine before you begin.

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 18.x or higher | `node -v` |
| npm | 9.x or higher | `npm -v` |
| Git | any recent version | `git --version` |

---

## 1. Clone the Repository

```bash
git clone https://github.com/Udopara/blueco.git
cd blueco
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Set Up Supabase

The app requires a Supabase project for authentication, the database, and file storage.

### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **New project**.
3. Fill in:
   - **Name:** `blueco` (or anything you prefer)
   - **Database password:** choose a strong password and save it somewhere safe
   - **Region:** pick the one closest to your users (e.g. Central Europe for low-latency from Africa)
4. Click **Create new project** and wait ~2 minutes for it to provision.

### 3.2 Get Your Project Credentials

1. In the Supabase dashboard, go to **Project Settings → API**.
2. Copy:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon / public key** — the long JWT string under *Project API keys*

### 3.3 Create the Database Schema

1. In the Supabase dashboard, open the **SQL Editor**.
2. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it.
   - This creates all tables, enums, RLS policies, and the trigger that auto-creates a profile row when a user registers.
3. Once the schema is applied, copy the entire contents of [`supabase/seed.sql`](./supabase/seed.sql) and run it.
   - This populates the `trades` and `skills` reference tables (Electrician, Plumber, Welder, etc.) that the job feed filters depend on.

Both files are safe to re-run — they use `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`.

### 3.4 Configure Storage (optional — for avatars)

1. In the Supabase dashboard, go to **Storage**.
2. Create a bucket named `avatars`.
3. Set the bucket to **Public** if you want avatar images to be viewable without authentication.

---

## 4. Configure Environment Variables

Create a file named `.env.local` in the project root:

```bash
touch .env.local
```

Open it and add the following — replacing the placeholder values with your actual Supabase credentials from step 3.2:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

> **Important:** Never commit `.env.local` to git. It is already listed in `.gitignore`.

---

## 5. Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## 6. Create Your First Accounts

The platform has two roles — you need at least one account of each type to test the full flow.

### Register as an Employer

1. Open [http://localhost:5173/register](http://localhost:5173/register).
2. Select the **Employer** tab.
3. Enter your **company name**, email, and password.
4. Click **Create account**.

### Register as a Worker

1. Open the register page in a separate browser or incognito window.
2. Select the **Worker** tab.
3. Enter your **full name**, email, and password.
4. Click **Create account**.

---

## 7. Verify Everything Works

| Step | What to check |
|------|--------------|
| Employer login | Lands on `/dashboard` |
| Post a job | Job appears on dashboard |
| Worker login | Lands on job feed at `/` |
| Job feed | The posted job is visible |
| Apply to job | Application status shows as *Pending* |
| Employer views applications | Application is listed under the job |
| Employer shortlists | Worker's status updates to *Shortlisted* |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the app for production (output to `dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

---

## Deploying to Vercel

1. Push the repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Vercel will auto-detect Vite. Leave the build settings as-is:
   - **Build command:** `vite build`
   - **Output directory:** `dist`
4. Before deploying, go to **Environment Variables** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**.

The `vercel.json` at the project root already handles SPA routing, so all routes (e.g. `/dashboard`, `/jobs/:id`) will work correctly on direct navigation.

---

## Project Structure

```
src/
├── components/       # Reusable UI components (Navbar, JobList, etc.)
├── context/          # React context providers (AuthContext)
├── hooks/            # Custom hooks (useApplications, useJobPosts, etc.)
├── lib/              # Supabase client, utilities
├── pages/
│   ├── auth/         # Login, Register, ProtectedRoute
│   ├── employer/     # Dashboard, PostJob, EditJob, JobApplications, CompanyProfile
│   └── worker/       # JobFeed, JobDetail, Applications, SavedJobs, WorkerProfile
├── types/            # Shared TypeScript interfaces
└── App.tsx           # Root router
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public API key |
