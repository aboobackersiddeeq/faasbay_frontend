# FaasBay E-Commerce Storefront (Frontend) 🛍️

A modern, high-performance, artisanal E-Commerce storefront and administrative management portal built with React 19, Vite, TanStack Router, and Tailwind CSS.

---

## 🏗️ Architecture & Deployment Flow

```
   GitHub (Frontend Repo)
          │
          ▼
   Frontend Hosting (Vercel / Netlify / Cloudflare Pages)
          │
          │  VITE_API_URL
          ▼
   Backend API Server (Render / Railway / VPS)
          │
          ▼
   Database Layer (Data Store / Orders / Inventory)
```

---

## 📁 Key Directories

```
ecommerce-frontend/
├── src/
│   ├── config/api.ts          # Centralized Backend API configuration (VITE_API_URL)
│   ├── components/            # UI components (Store, Cart, Checkout, Admin)
│   ├── hooks/                 # Custom hooks (Cart, Theme, Auth)
│   ├── routes/                # TanStack Router page routes
│   └── styles/                # Tailwind CSS styling tokens
├── public/                    # Static assets & icons
├── .env.example               # Frontend environment variables template
├── .gitignore                 # Production-safe Git exclusions
├── package.json               # Frontend dependencies & build scripts
└── vite.config.ts             # Vite build & bundle configuration
```

---

## ⚙️ Environment Configuration

Create a `.env` file locally:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Live Backend Server URL | `http://localhost:5001` or `https://faasbay-theme-backend.onrender.com` |
| `VITE_OPENAI_API_KEY` | *(Optional)* OpenAI API key for AI generation | `sk-...` |

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🚀 Production Deployment Steps

### Option A: Deploy to Vercel (Recommended)
1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **Add New ➔ Project**.
3. Import your frontend repository.
4. Set Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = Your backend URL (e.g., `https://faasbay-theme-backend.onrender.com`)
6. Click **Deploy**.

---

### Option B: Deploy to Netlify
1. Connect your repository on [Netlify](https://www.netlify.com/).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set Environment Variable: `VITE_API_URL` = `https://your-backend-url.com`
5. Deploy site.
