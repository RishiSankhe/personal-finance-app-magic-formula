import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const ALPHA_VANTAGE_API_KEY = Deno.env.get("ALPHA_VANTAGE_API_KEY");

interface StockData {
  symbol: string;
  name: string;
  price: number;
  earningsYield: number;
  returnOnCapital: number;
  magicFormulaRank: number;
  sector: string;
  marketCap: number;
}

interface AlphaVantageCompanyOverview {
  Symbol: string;
  Name: string;
  Sector: string;
  MarketCapitalization: string;
  PERatio: string;
  ReturnOnEquityTTM: string;
  [key: string]: string;
}

interface AlphaVantageQuote {
  "Global Quote": {
    "01. symbol": string;
    "05. price": string;
    [key: string]: string;
  };
}

const sectorStocks = {
  "Technology": ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX", "ADBE", "CRM"],
  "Healthcare": ["JNJ", "PFE", "UNH", "ABBV", "LLY", "TMO", "AZN", "NVS", "MRK", "DHR"],
  "Financial Services": ["JPM", "BAC", "WFC", "GS", "MS", "C", "AXP", "BLK", "SPGI", "CME"],
  "Consumer Discretionary": ["AMZN", "HD", "MCD", "NKE", "SBUX", "TGT", "LOW", "TJX", "BKNG", "ORLY"],
  "Communication Services": ["GOOGL", "META", "DIS", "NFLX", "CMCSA", "VZ", "T", "CHTR", "TMUS", "ATVI"],
  "Industrials": ["BA", "CAT", "HON", "UNP", "RTX", "LMT", "GE", "MMM", "UPS", "DE"],
  "Consumer Staples": ["PG", "KO", "PEP", "WMT", "COST", "MDLZ", "CL", "KMB", "GIS", "HSY"],
  "Energy": ["XOM", "CVX", "COP", "SLB", "EOG", "PXD", "KMI", "OXY", "PSX", "VLO"],
  "Materials": ["LIN", "APD", "SHW", "ECL", "FCX", "NEM", "DOW", "DD", "PPG", "IFF"],
  "Real Estate": ["PLD", "AMT", "CCI", "EQIX", "PSA", "WELL", "DLR", "O", "SBAC", "EXR"],
  "Utilities": ["NEE", "DUK", "SO", "AEP", "EXC", "XEL", "SRE", "PEG", "ED", "ETR"]
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sector, limit = 10 } = await req.json();
    
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error("AlphaVantage API key not configured");
    }

    // Get stocks for the selected sector
    let stocksToAnalyze: string[] = [];
    if (sector === "All Sectors") {
      stocksToAnalyze = Object.values(sectorStocks).flat().slice(0, limit);
    } else {
      stocksToAnalyze = sectorStocks[sector as keyof typeof sectorStocks] || [];
    }

    const stocks: StockData[] = [];
    
    // Rate limiting: Process stocks with delays to respect AlphaVantage limits
    for (let i = 0; i < Math.min(stocksToAnalyze.length, limit); i++) {
      const symbol = stocksToAnalyze[i];
      
      try {
        // Fetch company overview
        const overviewResponse = await fetch(
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        const overviewData: AlphaVantageCompanyOverview = await overviewResponse.json();

        // Fetch current price
        const quoteResponse = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        const quoteData: AlphaVantageQuote = await quoteResponse.json();

        if (overviewData.Symbol && quoteData["Global Quote"]) {
          const price = parseFloat(quoteData["Global Quote"]["05. price"]);
          const peRatio = parseFloat(overviewData.PERatio);
          const roe = parseFloat(overviewData.ReturnOnEquityTTM);
          const marketCap = parseFloat(overviewData.MarketCapitalization);

          // Calculate Magic Formula metrics
          const earningsYield = peRatio > 0 ? 1 / peRatio : 0;
          const returnOnCapital = roe / 100; // Convert percentage to decimal

          if (price > 0 && earningsYield > 0 && returnOnCapital > 0) {
            stocks.push({
              symbol: overviewData.Symbol,
              name: overviewData.Name,
              price,
              earningsYield,
              returnOnCapital,
              magicFormulaRank: 0, // Will be calculated after sorting
              sector: overviewData.Sector || sector,
              marketCap: marketCap || 0
            });
          }
        }

        // Add delay to respect rate limits (5 requests per minute for free tier)
        if (i < stocksToAnalyze.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 12000)); // 12 second delay
        }

      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    }

    // Calculate Magic Formula composite scores and rank
    stocks.forEach(stock => {
      // Magic Formula Score = Earnings Yield Rank + Return on Capital Rank
      // Lower combined rank is better
      stock.magicFormulaRank = 0; // Simplified for now
    });

    // Sort by Magic Formula criteria (higher earnings yield + higher return on capital)
    stocks.sort((a, b) => {
      const scoreA = a.earningsYield + a.returnOnCapital;
      const scoreB = b.earningsYield + b.returnOnCapital;
      return scoreB - scoreA; // Descending order
    });

    // Assign ranks
    stocks.forEach((stock, index) => {
      stock.magicFormulaRank = index + 1;
    });

    return new Response(
      JSON.stringify({ 
        stocks: stocks.slice(0, limit),
        sector,
        totalAnalyzed: stocks.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Magic Formula Screener Error:', error);
    
    // Return mock data as fallback
    const mockStocks: StockData[] = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 192.53,
        earningsYield: 0.058,
        returnOnCapital: 0.284,
        magicFormulaRank: 1,
        sector: "Technology",
        marketCap: 3000000000000
      },
      {
        symbol: "MSFT", 
        name: "Microsoft Corp.",
        price: 412.64,
        earningsYield: 0.032,
        returnOnCapital: 0.185,
        magicFormulaRank: 2,
        sector: "Technology",
        marketCap: 2800000000000
      }
    ];

    return new Response(
      JSON.stringify({ 
        stocks: mockStocks,
        sector: "Technology",
        fallback: true,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});