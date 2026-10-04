# ProjectFlow - Deployment Guide for Cloudflare Pages (Free Tier)

## 📋 Overview

ProjectFlow is a project management and inventory management web application that runs entirely on the client side using localStorage for data persistence. It can be deployed on **Cloudflare Pages** for free with no backend required.

### Features
- ✅ Project Management (create, edit, track projects)
- ✅ Task Management (Kanban-style boards per project)
- ✅ Inventory Management (track items, stock levels, costs)
- ✅ Team Management (members, roles, assignments)
- ✅ Activity Log (track all changes)
- ✅ Dashboard with overview stats
- ✅ Budget tracking per project
- ✅ Low stock alerts
- ✅ Responsive design (mobile + desktop)
- ✅ Data persistence via localStorage

---

## 🚀 Quick Deploy (Easiest Method)

### Option 1: Direct Upload via Cloudflare Dashboard

1. **Build the project locally:**
   ```bash
   npm install
   npm run build
   ```

2. **Go to Cloudflare Dashboard:**
   - Visit [https://dash.cloudflare.com](https://dash.cloudflare.com)
   - Sign up for a free account if you don't have one

3. **Navigate to Pages:**
   - Click "Workers & Pages" in the left sidebar
   - Click "Create"
   - Select the "Pages" tab
   - Choose "Upload assets" (direct upload)

4. **Upload:**
   - Give your project a name (e.g., `projectflow`)
   - Drag and drop the `dist/` folder from your build output
   - Click "Deploy site"

5. **Your site is live!** Cloudflare will give you a URL like:
   `https://projectflow.pages.dev`

---

### Option 2: Git Integration (Recommended for Updates)

This method connects your GitHub/GitLab repository to Cloudflare Pages for automatic deployments.

#### Step 1: Push your code to GitHub

```bash
# Initialize git repo (if not already done)
git init
git add .
git commit -m "Initial commit - ProjectFlow"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/projectflow.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Create** → **Pages**
3. Select **"Connect to Git"**
4. Choose your GitHub account and select the repository
5. Configure build settings:
   - **Framework preset:** Select "Vite" (or "None")
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `18` (or latest)
6. Click **"Save and Deploy"**

#### Step 3: Automatic Deployments

Now every push to `main` will trigger an automatic deployment! Pull requests will also get preview URLs.

---

## 🔧 Build Configuration

### Required Build Settings for Cloudflare Pages

| Setting | Value |
|---------|-------|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | 18+ |
| Root directory | `/` (or path to project) |

### Environment Variables (Optional)

No environment variables are required for the basic setup since all data is stored client-side.

If you want to add a backend later (e.g., Supabase), you can add:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

---

## 📁 Project Structure

```
projectflow/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tsconfig.json           # TypeScript config
├── src/
│   ├── main.tsx           # App entry point
│   ├── App.tsx            # Router setup
│   ├── index.css          # Global styles
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces
│   ├── store/
│   │   └── index.ts       # Data management (localStorage)
│   ├── components/
│   │   ├── Layout.tsx     # App layout with sidebar
│   │   └── Modal.tsx      # Reusable modal component
│   └── pages/
│       ├── Dashboard.tsx  # Overview dashboard
│       ├── Projects.tsx   # Projects list
│       ├── ProjectDetail.tsx  # Project detail + tasks
│       ├── Inventory.tsx  # Inventory management
│       ├── Team.tsx       # Team members
│       └── ActivityLog.tsx # Activity feed
└── DEPLOYMENT_GUIDE.md   # This file
```

---

## 💾 Data Storage

### How Data is Stored

All data is stored in the browser's **localStorage**. This means:
- ✅ No server costs
- ✅ Works offline
- ✅ Fast performance
- ⚠️ Data is per-browser (not shared between users)
- ⚠️ Data is lost if browser cache is cleared

### localStorage Keys

| Key | Description |
|-----|-------------|
| `pf_projects` | All projects |
| `pf_tasks` | All tasks |
| `pf_inventory` | All inventory items |
| `pf_team` | Team members |
| `pf_activities` | Activity log (last 50) |

### Data Export/Import

To backup your data, open the browser console and run:
```javascript
// Export all data
const data = {};
['pf_projects', 'pf_tasks', 'pf_inventory', 'pf_team', 'pf_activities'].forEach(key => {
  data[key] = localStorage.getItem(key);
});
console.log(JSON.stringify(data));
// Copy the output and save it somewhere safe

// Import data
const data = { /* paste your exported data here */ };
Object.entries(data).forEach(([key, value]) => {
  localStorage.setItem(key, value);
});
location.reload();
```

---

## 🔄 Upgrading to Multi-User (Optional)

If you need multiple users to share data, you can add a free backend:

### Option A: Supabase (Free Tier - Recommended)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Set up tables matching the TypeScript interfaces
4. Install the Supabase client: `npm install @supabase/supabase-js`
5. Replace the localStorage store with Supabase queries
6. Add environment variables in Cloudflare Pages dashboard

**Supabase Free Tier includes:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- Unlimited API requests

### Option B: Cloudflare Workers + D1 (Free Tier)

1. Create a D1 database in Cloudflare
2. Write a Worker to serve as API
3. Update the frontend to call the Worker API

**Cloudflare Workers Free Tier includes:**
- 100,000 requests/day
- D1: 5GB storage, 5M rows read/day

---

## 🌐 Custom Domain (Free with Cloudflare)

1. In Cloudflare Pages dashboard, go to your project
2. Click "Custom domains" → "Set up a custom domain"
3. Enter your domain (must be on Cloudflare DNS)
4. Follow the DNS configuration instructions
5. SSL certificate is automatically provisioned

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📊 Cloudflare Pages Free Tier Limits

| Resource | Free Limit |
|----------|-----------|
| Projects | 500 |
| Builds/month | Unlimited |
| Bandwidth | Unlimited |
| Requests | Unlimited |
| Custom domains | Unlimited |
| Concurrent builds | 1 |
| Build time | 5 minutes |

**This is more than enough for a small project management tool!**

---

## 🐛 Troubleshooting

### Build fails on Cloudflare
- Make sure Node.js version is 18+
- Check that `npm run build` works locally first
- Verify build output directory is `dist`

### Data not persisting
- localStorage is browser-specific
- Data won't sync between devices
- Consider upgrading to Supabase for shared data

### Page shows blank after deploy
- Check browser console for errors
- Verify all routes are handled in the SPA
- Add a `_redirects` file in `public/` with:
  ```
  /*    /index.html   200
  ```

---

## 📝 License

This project is open source and free to use for any purpose.

---

## 🙏 Credits

Built with:
- React 18
- Vite
- Tailwind CSS
- React Router
- Lucide Icons
- TypeScript
