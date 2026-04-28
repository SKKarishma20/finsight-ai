# FinSight AI

A multi-agent financial research assistant. Type a stock ticker and get a comprehensive AI-generated research brief in seconds — powered by a team of specialized agents working in parallel.

## What it does

- Runs 4 specialized agents simultaneously (market data, fundamentals, news, analyst sentiment)
- Synthesizes all data into a structured research brief using Llama 3.3 70B via Groq
- Human-in-the-loop review — approve the brief or give feedback to regenerate it
- Multi-turn chat to ask follow-up questions with full research context
- Rate limiting on all endpoints to protect API quotas

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, LangChain |
| LLM | Groq (Llama 3.3 70B) |
| Data | yfinance, NewsAPI |
| Frontend | React, TypeScript, Vite |

## Project Structure

finsight-ai/ ├── backend/ │ ├── agents/ │ │ ├── market_agent.py # Price, volume, technicals │ │ ├── fundamentals_agent.py # Ratios, earnings, financials │ │ ├── news_agent.py # Recent headlines │ │ ├── sentiment_agent.py # Analyst ratings & targets │ │ └── orchestrator.py # Parallel execution + LLM synthesis │ ├── main.py # FastAPI app + rate limiting │ └── requirements.txt └── frontend/ └── src/ ├── components/ │ ├── SearchBar.tsx │ ├── AgentStatus.tsx │ ├── ResearchBrief.tsx │ ├── HumanReview.tsx │ └── ChatPanel.tsx └── App.tsx


## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Groq API key](https://console.groq.com)
- [NewsAPI key](https://newsapi.org)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
uvicorn main:app --reload --port 8000
Frontend
cd frontend
npm install
npm run dev
Open http://localhost:5173.

Guardrails
Human-in-the-loop — every brief requires explicit approval before it's considered final. Users can provide feedback and trigger a regeneration loop.
Rate limiting — /research is capped at 2 req/min, /regenerate at 5 req/min, /chat at 10 req/min per IP.
Roadmap
Portfolio-level analysis across multiple tickers
Morning watchlist email digest
Confidence scoring per section
Public deployment
