# React Blog

A full-stack blog application built with React and ASP.NET Core 8. Users can browse posts without logging in, while authenticated authors can create and manage their own content. The app supports two post formats: simple text articles and visual posts with a custom canvas layout — images can be positioned freely, styled, and combined with flowing text.

The backend exposes a REST API with cookie-based authentication, role-based access control, and automatic database migrations on startup. Images are uploaded to Cloudinary via the API. The React frontend is a single-page app that talks to the backend through a Vite dev proxy.

## Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | ASP.NET Core 8, EF Core, PostgreSQL, ASP.NET Identity |

## Features

- **Simple posts** — classic title + text content
- **Visual posts** — drag-and-drop image placement, typography and layout styling
- **Image uploads** — JPEG/PNG/WebP, validated with ImageSharp, stored in Cloudinary
- **Authentication** — register, login, logout via HTTP-only cookies
- **Authorization** — authors edit their own posts; admins can edit any post
- **Rate limiting** — auth endpoints throttled to prevent brute-force attempts
- **Swagger** — interactive API docs in Development mode

## Getting Started

**Requirements:** .NET 8 SDK, Node.js 20+, Docker Desktop

### Database (PostgreSQL)

```bash
docker compose up -d
```

Starts PostgreSQL on `localhost:5432` (user: `blog`, password: `blog`, database: `reactblog`).

### Backend

```bash
cd backend/React_Blog
dotnet run
```

API: `http://localhost:5185` · Swagger: `http://localhost:5185/swagger`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (proxies `/api` to the backend)

### Cloudinary (wymagane do uploadu zdjęć)

1. Załóż konto na [cloudinary.com](https://cloudinary.com) i wejdź w **Dashboard**.
2. Na stronie głównej panelu znajdziesz **Product Environment Credentials**:
   - **Cloud name**
   - **API Key**
   - **API Secret** (kliknij „reveal” / ikonę oka)
3. Ustaw je lokalnie przez User Secrets (nie commituj sekretów):

```bash
cd backend/React_Blog
dotnet user-secrets set "Cloudinary:CloudName" "twoj-cloud-name"
dotnet user-secrets set "Cloudinary:ApiKey" "twoj-api-key"
dotnet user-secrets set "Cloudinary:ApiSecret" "twoj-api-secret"
```

Alternatywnie: zmienne środowiskowe `Cloudinary__CloudName`, `Cloudinary__ApiKey`, `Cloudinary__ApiSecret`.

## Configuration

Edit `backend/React_Blog/appsettings.json`:

- `ConnectionStrings:DefaultConnection` — PostgreSQL connection string
- `Cors:AllowedOrigins` — allowed frontend origin(s)
- `Cloudinary` — Cloud Name, API Key, API Secret (use User Secrets locally)
- `AdminSeed` — admin account created on first startup

Default admin credentials: `admin@blog.local` / `TymczasoweHasloAdmin123!` — change the password before deploying.

## Project Structure

```
docker-compose.yml    # PostgreSQL for local development
backend/React_Blog/   # REST API, EF Core, migrations
frontend/             # React SPA (Vite)
```
