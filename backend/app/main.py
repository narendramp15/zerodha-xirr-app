from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import os, requests, time, urllib.parse
from .kite import KiteClient
from .xirr import xirr, XIRRInput, Cashflow
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("KITE_API_KEY", "")
API_SECRET = os.getenv("KITE_API_SECRET", "")
REDIRECT_URL = os.getenv("KITE_REDIRECT_URL", "http://127.0.0.1:8000/auth/callback")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://127.0.0.1:5173")

app = FastAPI(title="Zerodha XIRR API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True, "ts": int(time.time())}

@app.get("/auth/login")
def auth_login():
    if not API_KEY or not REDIRECT_URL:
        raise HTTPException(status_code=500, detail="Missing API key or redirect URL")
    login_url = f"https://kite.zerodha.com/connect/login?v=3&api_key={API_KEY}"
    return {"login_url": login_url}

@app.get("/auth/callback")
def auth_callback(request: Request):
    params = dict(request.query_params)
    request_token = params.get("request_token")
    if not request_token:
        raise HTTPException(400, "Missing request_token")
    client = KiteClient(API_KEY, API_SECRET)
    try:
        session = client.generate_session(request_token)
    except Exception as e:
        raise HTTPException(400, f"Session error: {e}")
    # In real apps save access_token to DB tied to user
    # For demo, redirect with token in URL fragment so frontend can store it in sessionStorage
    url = f"{FRONTEND_ORIGIN}/#access_token={session['access_token']}"
    return RedirectResponse(url=url)

class XirrRequest(BaseModel):
    cashflows: List[Cashflow]

@app.post("/xirr")
def compute_xirr(payload: XirrRequest):
    try:
        rate = xirr(payload.cashflows)
        return {"xirr": rate}
    except Exception as e:
        raise HTTPException(400, f"XIRR error: {e}")

@app.get("/holdings")
def get_holdings(access_token: str):
    client = KiteClient(API_KEY, API_SECRET, access_token=access_token)
    try:
        holdings = client.get_holdings()
        return {"count": len(holdings), "data": holdings}
    except Exception as e:
        raise HTTPException(400, f"Holdings error: {e}")
