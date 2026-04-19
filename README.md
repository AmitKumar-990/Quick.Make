# 🍳 Quick Make — Smart Recipe Suggestion App

A full-stack MERN + Next.js recipe suggestion app with AI-powered features, complete SEO optimization, and a beautiful UI.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Groq |
| Auth | JWT + bcrypt |
| State | Zustand + React Query |
| Images | Cloudinary |
| Animations | Framer Motion |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key
- Cloudinary account (for image uploads)

---

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Environment Variables

**Backend** — copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```

Fill in:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quickmake
JWT_SECRET=jwt_secret
GEMINI_API_KEY=gemini_api_key
UNSPLASH_ACCESS_KEY=unsplash_api_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=http://localhost:3000
```

**Frontend** — copy `.env.local.example` to `.env.local`:
```bash
cp frontend/.env.local.example frontend/.env.local
```

Fill in:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-token
```

---

### 3. Seed the Database

```bash
cd backend
node scripts/seed.js
```

This creates:
- Admin user: `admin@quickmake.app` / `Admin@12345`
- 4 sample recipes

---

### 4. Run Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Runs on http://localhost:3000
```

---

## 🔍 SEO Features

### Implemented

| Feature | Implementation |
|---------|---------------|
| **Dynamic Metadata** | `generateMetadata()` per page with title, description, OG, Twitter |
| **Recipe Schema (JSON-LD)** | Full `Schema.org/Recipe` with ingredients, steps, nutrition, ratings |
| **Website JSON-LD** | `WebSite`, `WebApplication`, `Organization` schemas |
| **Search Action Schema** | Enables Google Sitelinks Searchbox |
| **Dynamic Sitemap** | `sitemap.ts` auto-generates recipe URLs from DB |
| **robots.txt** | Blocks private pages, allows recipe pages |
| **ISR** | Recipe pages revalidate every 10 mins |
| **SSR Home** | Featured recipes server-rendered for Googlebot |
| **Canonical URLs** | Every page has canonical link |
| **OG Images** | Per-recipe Open Graph images |
| **Twitter Cards** | `summary_large_image` cards |
| **PWA Manifest** | App installable, shortcuts, icons |
| **Security Headers** | X-Content-Type, X-Frame-Options, etc. |
| **Image Optimization** | Next.js Image with WebP/AVIF |
| **Core Web Vitals** | Lazy loading, compression, font optimization |
| **Semantic HTML** | Proper heading hierarchy, ARIA labels |
| **Schema.org Review** | Review structured data for star ratings |

### Google Search Console Setup

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your domain property
3. Get the verification meta tag
4. Add it to `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in `.env.local`
5. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

---

## 🤖 AI Features (Google Gemini)

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/ai/suggest` | Generate 3 recipes from ingredients + context |
| `POST /api/ai/context-ideas` | Get 5 cooking ideas from a description |
| `POST /api/ai/missing-ingredients` | Check what's missing for a recipe |
| `POST /api/ai/meal-plan` | Generate weekly meal plan |
| `POST /api/ai/generate-full-recipe` | Save AI recipe to database |

---

## 📱 Features

### Core
- ✅ Ingredient-based recipe suggestions (tag input + autocomplete)
- ✅ AI recipe generation (Claude)
- ✅ Filters: diet type, cuisine, difficulty, max time
- ✅ Recipe detail: ingredients, steps, nutrition, grocery list
- ✅ Missing ingredient checker
- ✅ Grocery list with categories + checkbox
- ✅ Search by recipe name
- ✅ Save / favorite recipes
- ✅ User auth (register / login / JWT)
- ✅ Ratings & reviews

### Bonus
- ✅ Dark mode
- ✅ Weekly meal planner
- ✅ User history tracking
- ✅ Upload your own recipes (with image)
- ✅ Infinite scroll
- ✅ Responsive / mobile-friendly
- ✅ PWA installable

---

## 🚢 Deployment

### Backend (Railway / Render / EC2)

```bash
# Build
npm start

# Environment variables needed:
# MONGODB_URI, JWT_SECRET, ANTHROPIC_API_KEY,
# CLOUDINARY_*, FRONTEND_URL, NODE_ENV=production
```

### Frontend (Vercel — recommended)

```bash
# In Vercel dashboard:
# - Root directory: frontend
# - Build command: npm run build
# - Output directory: .next

# Environment variables:
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
# NEXT_PUBLIC_SITE_URL=https://your-domain.com
# NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...
```

### MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist all IPs (`0.0.0.0/0`) or your server IP
4. Get connection string → add to `MONGODB_URI`

---

## 🔐 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/update-profile` | ✅ | Update profile |

### Recipes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/recipes` | — | List with filters |
| GET | `/api/recipes/:slug` | — | Recipe detail |
| GET | `/api/recipes/suggestions?ingredients=...` | — | Ingredient-based suggestions |
| GET | `/api/recipes/autocomplete?q=...` | — | Ingredient autocomplete |
| GET | `/api/recipes/:slug/grocery-list` | — | Grocery list |
| POST | `/api/recipes` | ✅ | Create recipe |
| PUT | `/api/recipes/:id` | ✅ | Update recipe |
| DELETE | `/api/recipes/:id` | ✅ | Delete recipe |
| POST | `/api/recipes/:id/save` | ✅ | Save/unsave |

### Reviews
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/reviews?recipeId=...` | — |
| POST | `/api/reviews` | ✅ |
| PUT | `/api/reviews/:id` | ✅ |
| DELETE | `/api/reviews/:id` | ✅ |

---

## 📊 Performance Tips

1. **Enable MongoDB Atlas Search** for better text search
2. **Set up CDN** (Cloudflare) in front of your app
3. **Enable Next.js ISR** — already configured for recipe pages
4. **Add Redis** for API response caching in production
5. **Use MongoDB indexes** — already defined in schemas

---

## 🛡️ Security

- Helmet.js security headers
- Rate limiting (100 req/15min general, 20/min for AI)
- MongoDB sanitization (prevent NoSQL injection)
- JWT tokens (30-day expiry)
- Input validation (express-validator)
- CORS restricted to frontend URL
- File upload type/size restrictions

---

## 📝 License

Free to use, modify, and deploy.

---

Built with ❤️ using Next.js, Express, MongoDB, and Claude AI.
