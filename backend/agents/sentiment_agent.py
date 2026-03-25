import yfinance as yf


def run_sentiment_agent(ticker: str) -> dict:
    """Fetches analyst recommendations and ratings."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info or {}
        recs = stock.recommendations

        analyst_summary = None
        if recs is not None and not recs.empty:
            latest = recs.tail(5).to_dict(orient="records")
            analyst_summary = latest

        return {
            "recommendation": info.get("recommendationKey"),
            "target_mean_price": info.get("targetMeanPrice"),
            "target_high_price": info.get("targetHighPrice"),
            "target_low_price": info.get("targetLowPrice"),
            "number_of_analysts": info.get("numberOfAnalystOpinions"),
            "recent_recommendations": analyst_summary,
        }
    except Exception as e:
        return {"error": str(e)}
