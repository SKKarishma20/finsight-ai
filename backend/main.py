from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

from agents.orchestrator import run_orchestrator, regenerate_with_feedback, chat_followup

# 1 research request per 30s, 5 chat messages per minute, per IP
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="FinSight AI API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    ticker: str


class RegenerateRequest(BaseModel):
    ticker: str
    company: str
    original_brief: str
    feedback: str
    raw_data: dict


class ChatRequest(BaseModel):
    ticker: str
    company: str
    brief: str
    raw_data: dict
    messages: list[dict]


@app.post("/research")
@limiter.limit("2/minute")
async def get_research(request: Request, req: ResearchRequest):
    ticker = req.ticker.strip().upper()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker is required")
    try:
        result = await run_orchestrator(ticker)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/regenerate")
@limiter.limit("5/minute")
async def regenerate(request: Request, req: RegenerateRequest):
    try:
        result = await regenerate_with_feedback(
            req.ticker, req.company, req.original_brief, req.feedback, req.raw_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
@limiter.limit("10/minute")
async def chat(request: Request, req: ChatRequest):
    try:
        reply = await chat_followup(
            req.ticker, req.company, req.brief, req.raw_data, req.messages
        )
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}
