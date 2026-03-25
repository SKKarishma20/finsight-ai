import asyncio
from concurrent.futures import ThreadPoolExecutor
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from .market_agent import run_market_agent
from .fundamentals_agent import run_fundamentals_agent
from .news_agent import run_news_agent
from .sentiment_agent import run_sentiment_agent


SYSTEM_PROMPT = """You are FinSight AI, an expert financial research analyst.
You will receive structured data from multiple specialized agents covering:
- Market data (price, volume, technicals)
- Fundamentals (financials, ratios, earnings)
- Recent news headlines
- Analyst sentiment and price targets

Synthesize this into a concise, insightful research brief with these sections:
1. Executive Summary (2-3 sentences)
2. Market Overview
3. Fundamental Analysis
4. Recent Developments (from news)
5. Analyst Sentiment
6. Key Risks & Opportunities
7. Verdict (bullish / neutral / bearish with reasoning)

Be direct, data-driven, and avoid generic filler. Format using markdown."""


def _run_agents_parallel(ticker: str, company_name: str) -> dict:
    query = company_name or ticker
    with ThreadPoolExecutor(max_workers=4) as executor:
        f_market = executor.submit(run_market_agent, ticker)
        f_fundamentals = executor.submit(run_fundamentals_agent, ticker)
        f_news = executor.submit(run_news_agent, query)
        f_sentiment = executor.submit(run_sentiment_agent, ticker)

        return {
            "market": f_market.result(),
            "fundamentals": f_fundamentals.result(),
            "news": f_news.result(),
            "sentiment": f_sentiment.result(),
        }


async def run_orchestrator(ticker: str) -> dict:
    """Runs all agents in parallel, then synthesizes with LLM."""
    loop = asyncio.get_event_loop()

    # Run data agents in thread pool (they're sync/blocking)
    agent_data = await loop.run_in_executor(
        None, _run_agents_parallel, ticker, ticker
    )

    # Use company name from fundamentals for better news search
    company_name = agent_data["fundamentals"].get("company_name", ticker)
    if company_name and company_name != ticker:
        agent_data["news"] = await loop.run_in_executor(
            None, run_news_agent, company_name
        )

    # Synthesize with LLM
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.3)
    user_content = f"""
Ticker: {ticker.upper()}
Company: {company_name}

=== MARKET DATA ===
{agent_data['market']}

=== FUNDAMENTALS ===
{agent_data['fundamentals']}

=== RECENT NEWS ===
{agent_data['news']}

=== ANALYST SENTIMENT ===
{agent_data['sentiment']}

Generate the research brief now.
"""
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_content),
    ]

    response = await llm.ainvoke(messages)

    return {
        "ticker": ticker.upper(),
        "company": company_name,
        "brief": response.content,
        "raw_data": agent_data,
    }


async def regenerate_with_feedback(
    ticker: str,
    company: str,
    original_brief: str,
    feedback: str,
    raw_data: dict,
) -> dict:
    """Regenerates the brief incorporating human feedback."""
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.3)

    user_content = f"""
Ticker: {ticker}
Company: {company}

=== ORIGINAL BRIEF ===
{original_brief}

=== HUMAN REVIEWER FEEDBACK ===
{feedback}

=== RAW DATA (for reference) ===
Market: {raw_data.get('market')}
Fundamentals: {raw_data.get('fundamentals')}
News: {raw_data.get('news')}
Sentiment: {raw_data.get('sentiment')}

Please revise the research brief addressing the reviewer's feedback. Keep what was good, fix what was flagged.
"""
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_content),
    ]

    response = await llm.ainvoke(messages)

    return {
        "ticker": ticker,
        "company": company,
        "brief": response.content,
        "raw_data": raw_data,
    }


async def chat_followup(
    ticker: str,
    company: str,
    brief: str,
    raw_data: dict,
    messages: list[dict],
) -> str:
    """Answers follow-up questions with full research context + conversation history."""
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.4)

    context = f"""You are FinSight AI, a financial research assistant. You already generated a research brief for {company} ({ticker}).

Here is the research brief you produced:
{brief}

Raw data available:
- Market: {raw_data.get('market')}
- Fundamentals: {raw_data.get('fundamentals')}
- News: {raw_data.get('news')}
- Sentiment: {raw_data.get('sentiment')}

Answer follow-up questions concisely and accurately based on this data. If something isn't in the data, say so clearly."""

    chat_messages = [SystemMessage(content=context)]
    for msg in messages:
        if msg["role"] == "user":
            chat_messages.append(HumanMessage(content=msg["content"]))
        else:
            from langchain_core.messages import AIMessage
            chat_messages.append(AIMessage(content=msg["content"]))

    response = await llm.ainvoke(chat_messages)
    return response.content
