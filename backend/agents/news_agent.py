import os
import httpx


NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_API_URL = "https://newsapi.org/v2/everything"


def run_news_agent(query: str) -> dict:
    """Fetches recent news headlines for the company."""
    try:
        if not NEWS_API_KEY:
            return {"error": "NEWS_API_KEY not set"}

        resp = httpx.get(
            NEWS_API_URL,
            params={
                "q": query,
                "sortBy": "publishedAt",
                "pageSize": 5,
                "language": "en",
                "apiKey": NEWS_API_KEY,
            },
            timeout=10,
        )
        resp.raise_for_status()
        articles = resp.json().get("articles", [])

        return {
            "articles": [
                {
                    "title": a["title"],
                    "source": a["source"]["name"],
                    "published": a["publishedAt"],
                    "url": a["url"],
                    "description": a.get("description", ""),
                }
                for a in articles
            ]
        }
    except Exception as e:
        return {"error": str(e)}
