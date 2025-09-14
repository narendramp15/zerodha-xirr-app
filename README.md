# Zerodha Holdings + XIRR (MVP)

A minimal full‑stack app that:
- Authenticates with Zerodha **Kite Connect** (OAuth) to fetch **Holdings**.
- Computes **XIRR** from arbitrary cashflows you provide (e.g., from Tradebook + Dividend CSVs).

> ⚠️ Production use requires a paid Kite Connect app and secure token storage.

## Stack
- **Backend:** FastAPI (Python), requests
- **Frontend:** React (Vite)
- **Auth:** Kite Connect v3 (request_token -> access_token)
- **XIRR:** Newton method (no external deps)

## Quick start

### 1) Create a Kite Connect app
- Go to https://kite.trade/apps (My Apps) and create a new app.
- Set **Redirect URL** to `http://127.0.0.1:8000/auth/callback` (or your domain).

### 2) Configure backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env with KITE_API_KEY and KITE_API_SECRET
cd ..
```

### 3) Run API
```bash
cd backend
bash run_uvicorn.sh
# API: http://127.0.0.1:8000
```

### 4) Run frontend
```bash
cd frontend
npm install
npm run dev
# Web: http://127.0.0.1:5173
```

Open the web app and click **Login with Kite**. After login, you'll be redirected back, and the access token will be stored in session storage. Then click **Fetch Holdings**.

### Docker (optional)
```bash
docker compose up --build
```

## XIRR inputs
XIRR needs dated cashflows:
- **Buys**: negative amounts on trade dates (from **Console ➜ Reports ➜ Tradebook** CSV).
- **Sells**: positive amounts (proceeds).
- **Dividends**: positive amounts (from **Console ➜ Holdings ➜ View Dividends**, export).

Use the `/xirr` endpoint:
```json
POST /xirr
{
  "cashflows": [
    {"date":"2024-01-10T00:00:00","amount":-100000},
    {"date":"2024-06-10T00:00:00","amount":-25000},
    {"date":"2025-09-10T00:00:00","amount":145000}
  ]
}
```

## Notes
- Holdings endpoint: `GET /portfolio/holdings` (Kite Connect).  
- Dividends are **not** available via a dedicated API; export from Console.
- For accurate returns, include all cash inflows/outflows, including brokerage/charges if desired.

## Hardening TODO
- Persist user sessions + tokens (DB/Redis)
- Parse CSV uploads (Tradebook, Dividends) to auto-build cashflows
- Add authentication and multi‑user support
- Error handling, rate-limit/backoff
- CI/CD (GitHub Actions), IaC (Terraform), secret management (AWS Secrets Manager)
