# StrideIQ 

### DEMO


https://github.com/user-attachments/assets/b09cc163-f351-42a1-aaca-3f22e21592a2




Minimal steps to run the project.

## Backend (server)
```bash
cd server
npm install
npx prisma generate
npm run dev
```
- Add DatabaseURL in .env file
- This project uses Neon DB

- Base URL: `http://localhost:3000`
- Health: `GET /api/ping`
- Evaluate: `POST /policies/evaluate`
- Rules: `GET POST DELETE PATCH rules`
- Evaluations: `GET /evaluations`

- IMP - cd/server

## Frontend (ui)
```bash
cd strideiq/strideiq
npm install
npm run dev
```
- Open the shown URL (`http://localhost:5173`).
- Use the Rules, Test, and Recent Evaluations panels.
- add const API_BASE = "http://localhost:3000"; APP.tsx

- IMP- cd/strideiq



