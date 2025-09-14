# ! /usr/bin/env bash
# export $(grep -v '^#' .env | xargs) || true
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

