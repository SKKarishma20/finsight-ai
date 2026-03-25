import yfinance as yf


def run_fundamentals_agent(ticker: str) -> dict:
    """Fetches key financial ratios and earnings data."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info or {}

        return {
            "company_name": info.get("longName"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "pe_ratio": info.get("trailingPE"),
            "forward_pe": info.get("forwardPE"),
            "peg_ratio": info.get("pegRatio"),
            "price_to_book": info.get("priceToBook"),
            "revenue": info.get("totalRevenue"),
            "gross_margins": info.get("grossMargins"),
            "operating_margins": info.get("operatingMargins"),
            "profit_margins": info.get("profitMargins"),
            "eps": info.get("trailingEps"),
            "forward_eps": info.get("forwardEps"),
            "debt_to_equity": info.get("debtToEquity"),
            "return_on_equity": info.get("returnOnEquity"),
            "free_cashflow": info.get("freeCashflow"),
            "description": info.get("longBusinessSummary", "")[:500],
        }
    except Exception as e:
        return {"error": str(e)}
