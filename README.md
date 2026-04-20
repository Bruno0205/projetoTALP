# TALP Project

This project contains:
- `backend/` (Node.js + TypeScript + Express)
- `frontend/` (React + TypeScript + Vite)
- `tests/` (Cucumber + TypeScript + Supertest)
- `features/` (acceptance criteria in Gherkin)

## Prerequisites

- Node.js 18+
- npm 9+

Check versions:

```bash
node -v
npm -v
```

## 1) Run the Backend

```bash
cd backend
npm install
npm run dev
```

- Default API base URL: `http://localhost:3000`
- Main API prefix: `http://localhost:3000/api`

## 2) Run the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

- Vite will print a local URL (usually `http://localhost:5173`)
- Frontend is configured to call backend at `http://localhost:3000/api`

## 3) Run Acceptance Tests

Open a third terminal:

```bash
cd tests
npm install
npm test
```

## Optional: Production Builds

### Backend build

```bash
cd backend
npm run build
npm start
```

### Frontend build

```bash
cd frontend
npm run build
npm run preview
```

## Notes

- Data is persisted in JSON files under `backend/data/`.
- If you want a clean local state, reset these files to `[]`:
  - `backend/data/students.json`
  - `backend/data/classes.json`
  - `backend/data/evaluations.json`
  - `backend/data/emailQueue.json`
  - `backend/data/emailLog.json`
