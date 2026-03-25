import yfinance as yf


def run_market_agent(ticker: str) -> dict:
    """Fetches price, volume, and basic technical data."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info or {}
        hist = stock.history(period="1mo")

        price = (
            info.get("currentPrice")
            or info.get("regularMarketPrice")
            or info.get("previousClose")
        )
        prev_close = info.get("previousClose")
        change_pct = ((price - prev_close) / prev_close * 100) if price and prev_close else None

        return {
            "ticker": ticker.upper(),
            "price": price,
            "change_pct": round(change_pct, 2) if change_pct else None,
            "volume": info.get("volume"),
            "avg_volume": info.get("averageVolume"),
            "52w_high": info.get("fiftyTwoWeekHigh"),
            "52w_low": info.get("fiftyTwoWeekLow"),
            "market_cap": info.get("marketCap"),
            "beta": info.get("beta"),
            "data_points": len(hist),
        }
    except Exception as e:
        return {"error": str(e)}
