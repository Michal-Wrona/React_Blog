# React Blog

A full-stack blog application built with React and ASP.NET Core 8. Users can browse posts without logging in, while authenticated authors can create and manage their own content. The app supports two post formats: simple text articles and visual posts with a custom canvas layout — images can be positioned freely, styled, and combined with flowing text.

The backend exposes a REST API with cookie-based authentication, role-based access control, and automatic database migrations on startup. Images are uploaded, resized, and served from the API. The React frontend is a single-page app that talks to the backend through a Vite dev proxy.

## Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | ASP.NET Core 8, EF Core, PostgreSQL, ASP.NET Identity |

## Features

- **Simple posts** — classic title + text content
- **Visual posts** — drag-and-drop image placement, typography and layout styling
- **Image uploads** — JPEG/PNG/WebP, server-side optimization (ImageSharp)
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

App: `http://localhost:5173` (proxies `/api` and `/uploads` to the backend)

## Configuration

Edit `backend/React_Blog/appsettings.json`:

- `ConnectionStrings:DefaultConnection` — PostgreSQL connection string
- `Cors:AllowedOrigins` — allowed frontend origin(s)
- `AdminSeed` — admin account created on first startup

Default admin credentials: `admin@blog.local` / `TymczasoweHasloAdmin123!` — change the password before deploying.

## Project Structure

```
docker-compose.yml    # PostgreSQL for local development
backend/React_Blog/   # REST API, EF Core, migrations
frontend/             # React SPA (Vite)
```
