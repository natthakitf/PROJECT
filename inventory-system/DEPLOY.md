# Deploy Guide

## Architecture

- Deploy only the `Backend` service.
- The backend now serves the static files from `Frontend`.
- Use one shared MySQL database so all machines see the same data.

## Option 1: Deploy to a VPS

1. Copy the project to the server.
2. Create `Backend/.env` from `Backend/.env.example`.
3. Set a real `JWT_SECRET`.
4. Point database settings to your shared MySQL server.
5. Run:

```bash
cd Backend
npm install
npm start
```

6. Open:

```text
http://YOUR_SERVER_IP:3000
```

## Option 2: Deploy with Docker

1. Create `Backend/.env`.
2. Build and run:

```bash
cd Backend
docker build -t inventory-system .
docker run --env-file .env -p 3000:3000 inventory-system
```

## Required Environment Variables

Use `Backend/.env.example` as the template.

- `PORT`
- `JWT_SECRET`
- `DATABASE_URL` or normal DB settings below
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Recommended Production Setup

- Frontend URL: served by backend on the same domain
- Backend URL: same domain, same service
- Database: cloud MySQL or VPS MySQL
- Reverse proxy: Nginx or Caddy in front of Node.js

## Notes

- Do not use `localhost` for database if users connect from other machines.
- Use one central MySQL server so every client sees the same inventory data.
- If you use a cloud database, set `DATABASE_URL` when your provider gives one.
