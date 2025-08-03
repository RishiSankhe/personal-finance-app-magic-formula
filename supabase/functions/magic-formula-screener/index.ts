import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");

interface StockData {
  symbol: string;
  name: string;
  price: number;
  earningsYield: number;
  returnOnCapital: number;
  magicFormulaRank: number;
  overallRank: number;
  sector: string;
  marketCap: number;
  peRatio: number;
  eps: number;
  revenue: number;
  sharesYouCanBuy: number;
  investmentAllocation: number;
  country: string;
  exchange: string;
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

interface FinnhubQuote {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high price of the day
  l: number; // low price of the day
  o: number; // open price of the day
  pc: number; // previous close price
  t: number; // timestamp
}

interface FinnhubMetrics {
  metric: {
    "10DayAverageTradingVolume": number;
    "13WeekPriceReturnDaily": number;
    "26WeekPriceReturnDaily": number;
    "3MonthAverageTradingVolume": number;
    "52WeekHigh": number;
    "52WeekHighDate": string;
    "52WeekLow": number;
    "52WeekLowDate": string;
    "52WeekPriceReturnDaily": number;
    "5DayPriceReturnDaily": number;
    "assetTurnoverAnnual": number;
    "assetTurnoverTTM": number;
    "beta": number;
    "bookValuePerShareAnnual": number;
    "bookValuePerShareQuarterly": number;
    "cashPerSharePerShareAnnual": number;
    "cashPerSharePerShareQuarterly": number;
    "currentRatioAnnual": number;
    "currentRatioQuarterly": number;
    "ebitdPerShareTTM": number;
    "ebitdaCagr5Y": number;
    "ebitdaInterimCagr5Y": number;
    "epsBasicExclExtraItemsAnnual": number;
    "epsBasicExclExtraItemsTTM": number;
    "epsExclExtraItemsAnnual": number;
    "epsExclExtraItemsTTM": number;
    "epsGrowth3Y": number;
    "epsGrowth5Y": number;
    "epsGrowthQuarterlyYoy": number;
    "epsGrowthTTMYoy": number;
    "epsInclExtraItemsAnnual": number;
    "epsInclExtraItemsTTM": number;
    "epsNormalizedAnnual": number;
    "focfCagr5Y": number;
    "freeCashFlowAnnual": number;
    "freeCashFlowPerShareTTM": number;
    "freeCashFlowTTM": number;
    "freeOperatingCashFlow/revenue5Y": number;
    "freeOperatingCashFlow/revenueTTM": number;
    "grossMargin5Y": number;
    "grossMarginAnnual": number;
    "grossMarginTTM": number;
    "inventoryTurnoverAnnual": number;
    "inventoryTurnoverTTM": number;
    "longTermDebt/equityAnnual": number;
    "longTermDebt/equityQuarterly": number;
    "marketCapitalization": number;
    "monthToDatePriceReturnDaily": number;
    "netDebtAnnual": number;
    "netDebtInterim": number;
    "netIncomeEmployeeAnnual": number;
    "netIncomeEmployeeTTM": number;
    "netInterestCoverageAnnual": number;
    "netInterestCoverageTTM": number;
    "netMarginGrowth5Y": number;
    "netProfitMargin5Y": number;
    "netProfitMarginAnnual": number;
    "netProfitMarginTTM": number;
    "operatingMargin5Y": number;
    "operatingMarginAnnual": number;
    "operatingMarginTTM": number;
    "payoutRatioAnnual": number;
    "payoutRatioTTM": number;
    "pbAnnual": number;
    "pbQuarterly": number;
    "pcfShareTTM": number;
    "peBasicExclExtraTTM": number;
    "peExclExtraAnnual": number;
    "peExclExtraHighTTM": number;
    "peExclExtraTTM": number;
    "peInclExtraTTM": number;
    "peNormalizedAnnual": number;
    "pfcfShareAnnual": number;
    "pfcfShareTTM": number;
    "pretaxMargin5Y": number;
    "pretaxMarginAnnual": number;
    "pretaxMarginTTM": number;
    "priceRelativeToS&P50013Week": number;
    "priceRelativeToS&P50026Week": number;
    "priceRelativeToS&P5004Week": number;
    "priceRelativeToS&P50052Week": number;
    "priceRelativeToS&P500Ytd": number;
    "psAnnual": number;
    "psTTM": number;
    "ptbvAnnual": number;
    "ptbvQuarterly": number;
    "quickRatioAnnual": number;
    "quickRatioQuarterly": number;
    "receivablesTurnoverAnnual": number;
    "receivablesTurnoverTTM": number;
    "revenueEmployeeAnnual": number;
    "revenueEmployeeTTM": number;
    "revenueGrowth3Y": number;
    "revenueGrowth5Y": number;
    "revenueGrowthQuarterlyYoy": number;
    "revenueGrowthTTMYoy": number;
    "revenuePerShareAnnual": number;
    "revenuePerShareTTM": number;
    "revenueShareGrowth5Y": number;
    "roa5Y": number;
    "roaRfy": number;
    "roaTTM": number;
    "roe5Y": number;
    "roeRfy": number;
    "roeTTM": number;
    "roi5Y": number;
    "roiAnnual": number;
    "roiTTM": number;
    "tangibleBookValuePerShareAnnual": number;
    "tangibleBookValuePerShareQuarterly": number;
    "tbvCagr5Y": number;
    "totalDebt/totalEquityAnnual": number;
    "totalDebt/totalEquityQuarterly": number;
    "yearToDatePriceReturnDaily": number;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sector, investmentAmount = 15000, limit = 50 } = await req.json();
    
    if (!FINNHUB_API_KEY) {
      throw new Error("Finnhub API key not configured");
    }

    console.log(`Starting screener for sector: ${sector}, investment: $${investmentAmount}`);

    // Get all US stocks symbols from Finnhub
    const symbolsResponse = await fetch(
      `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${FINNHUB_API_KEY}`
    );
    const allSymbols = await symbolsResponse.json();
    
    console.log(`Found ${allSymbols.length} total US stocks`);

    // Filter symbols based on sector or get a diverse sample
    let symbolsToAnalyze = [];
    
    if (sector === "All Sectors") {
      // Sample across different market caps and exchanges
      symbolsToAnalyze = allSymbols
        .filter((stock: any) => stock.type === "Common Stock")
        .slice(0, Math.min(100, limit * 2)); // Get more for better filtering
    } else {
      // For specific sectors, we'll filter after getting company profiles
      symbolsToAnalyze = allSymbols
        .filter((stock: any) => stock.type === "Common Stock")
        .slice(0, Math.min(150, limit * 3)); // Get more to filter by sector
    }

    const stocks: StockData[] = [];
    const processLimit = Math.min(symbolsToAnalyze.length, 30); // Process more stocks for better results
    
    console.log(`Processing ${processLimit} stocks...`);

    for (let i = 0; i < processLimit; i++) {
      const symbol = symbolsToAnalyze[i].symbol;
      
      try {
        console.log(`Fetching data for ${symbol} (${i + 1}/${processLimit})...`);
        
        // Fetch multiple data points in parallel
        const [profileResponse, quoteResponse, metricsResponse] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
          fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
          fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`)
        ]);

        const [profileData, quoteData, metricsData] = await Promise.all([
          profileResponse.json() as Promise<FinnhubProfile>,
          quoteResponse.json() as Promise<FinnhubQuote>,
          metricsResponse.json() as Promise<FinnhubMetrics>
        ]);

        // Skip if essential data is missing
        if (!profileData.name || !quoteData.c || quoteData.c <= 0) {
          console.log(`Skipping ${symbol} - missing essential data`);
          continue;
        }

        // Filter by sector if specified
        if (sector !== "All Sectors") {
          const stockSector = profileData.finnhubIndustry || "";
          const sectorMatch = checkSectorMatch(sector, stockSector);
          if (!sectorMatch) {
            continue;
          }
        }

        // Calculate Magic Formula metrics
        const price = quoteData.c;
        const marketCap = profileData.marketCapitalization || 0;
        
        // Skip penny stocks and very large caps for better magic formula results
        if (price < 2 || marketCap > 100000000000) {
          continue;
        }

        const peRatio = metricsData?.metric?.peExclExtraTTM || 0;
        const roe = metricsData?.metric?.roeTTM || 0;
        const eps = metricsData?.metric?.epsExclExtraItemsTTM || 0;
        const revenue = profileData.marketCapitalization * (metricsData?.metric?.psTTM || 1);

        // Calculate Magic Formula components
        const earningsYield = peRatio > 0 ? 1 / peRatio : 0;
        const returnOnCapital = roe || 0;

        // Calculate shares you can buy with investment amount
        const maxInvestmentPerStock = investmentAmount * 0.2; // Max 20% in one stock
        const sharesYouCanBuy = Math.floor(maxInvestmentPerStock / price);
        const investmentAllocation = sharesYouCanBuy * price;

        // Only include stocks where metrics are valid and you can buy meaningful shares
        if (earningsYield > 0 && returnOnCapital > 0 && sharesYouCanBuy >= 1) {
          stocks.push({
            symbol: symbol,
            name: profileData.name,
            price: price,
            earningsYield: earningsYield,
            returnOnCapital: returnOnCapital / 100, // Convert to decimal
            magicFormulaRank: 0,
            overallRank: 0,
            sector: profileData.finnhubIndustry || "Unknown",
            marketCap: marketCap,
            peRatio: peRatio,
            eps: eps,
            revenue: revenue,
            sharesYouCanBuy: sharesYouCanBuy,
            investmentAllocation: investmentAllocation,
            country: profileData.country,
            exchange: profileData.exchange
          });
          
          console.log(`Added ${symbol}: Price $${price}, Shares: ${sharesYouCanBuy}, Allocation: $${investmentAllocation}`);
        }

        // Small delay to respect API limits
        if (i < processLimit - 1 && i % 10 === 9) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    }

    console.log(`Successfully processed ${stocks.length} stocks`);

    // Calculate Magic Formula rankings
    // First, rank by earnings yield (higher is better)
    const sortedByEY = [...stocks].sort((a, b) => b.earningsYield - a.earningsYield);
    const eyRanks = new Map<string, number>();
    sortedByEY.forEach((stock, index) => {
      eyRanks.set(stock.symbol, index + 1);
    });

    // Then rank by return on capital (higher is better)
    const sortedByROC = [...stocks].sort((a, b) => b.returnOnCapital - a.returnOnCapital);
    const rocRanks = new Map<string, number>();
    sortedByROC.forEach((stock, index) => {
      rocRanks.set(stock.symbol, index + 1);
    });

    // Calculate combined Magic Formula rank (lower combined rank is better)
    stocks.forEach(stock => {
      const eyRank = eyRanks.get(stock.symbol) || 999;
      const rocRank = rocRanks.get(stock.symbol) || 999;
      stock.magicFormulaRank = eyRank + rocRank;
    });

    // Sort by Magic Formula rank and assign overall rankings
    stocks.sort((a, b) => a.magicFormulaRank - b.magicFormulaRank);
    stocks.forEach((stock, index) => {
      stock.overallRank = index + 1;
    });

    // Separate results into general recommendations and price-optimized recommendations
    const generalRecommendations = stocks.slice(0, Math.min(limit, 20));
    
    // Price-optimized recommendations: focus on stocks where investment buys meaningful positions
    const priceOptimized = stocks
      .filter(stock => {
        const investmentWeight = stock.investmentAllocation / investmentAmount;
        return investmentWeight >= 0.05 && investmentWeight <= 0.25 && stock.sharesYouCanBuy >= 10;
      })
      .sort((a, b) => {
        // Sort by combination of Magic Formula rank and investment efficiency
        const efficiencyA = a.sharesYouCanBuy / (a.overallRank || 1);
        const efficiencyB = b.sharesYouCanBuy / (b.overallRank || 1);
        return efficiencyB - efficiencyA;
      })
      .slice(0, Math.min(limit, 15));

    return new Response(
      JSON.stringify({ 
        generalRecommendations,
        priceOptimizedRecommendations: priceOptimized,
        investmentAmount,
        sector,
        totalAnalyzed: stocks.length,
        totalInMarket: allSymbols.length
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
    
    // Return enhanced mock data as fallback
    const mockStocks: StockData[] = [
      {
        symbol: "NVEI",
        name: "Nuvei Corporation",
        price: 28.45,
        earningsYield: 0.125,
        returnOnCapital: 0.18,
        magicFormulaRank: 1,
        overallRank: 15,
        sector: "Technology",
        marketCap: 4200000000,
        peRatio: 8.0,
        eps: 3.56,
        revenue: 850000000,
        sharesYouCanBuy: Math.floor(3000 / 28.45),
        investmentAllocation: Math.floor(3000 / 28.45) * 28.45,
        country: "CA",
        exchange: "NASDAQ"
      },
      {
        symbol: "RICK",
        name: "RCI Hospitality Holdings Inc",
        price: 45.67,
        earningsYield: 0.089,
        returnOnCapital: 0.156,
        magicFormulaRank: 2,
        overallRank: 23,
        sector: "Consumer Discretionary",
        marketCap: 425000000,
        peRatio: 11.2,
        eps: 4.08,
        revenue: 185000000,
        sharesYouCanBuy: Math.floor(3000 / 45.67),
        investmentAllocation: Math.floor(3000 / 45.67) * 45.67,
        country: "US",
        exchange: "NASDAQ"
      }
    ];

    return new Response(
      JSON.stringify({ 
        generalRecommendations: mockStocks,
        priceOptimizedRecommendations: mockStocks,
        investmentAmount: 15000,
        sector: sector || "All Sectors",
        fallback: true,
        error: error.message,
        totalAnalyzed: 2,
        totalInMarket: 8000
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

function checkSectorMatch(targetSector: string, stockSector: string): boolean {
  const sectorMappings: { [key: string]: string[] } = {
    "Technology": ["Software", "Hardware", "Semiconductors", "IT Services", "Technology"],
    "Healthcare": ["Healthcare", "Pharmaceuticals", "Biotechnology", "Medical", "Health"],
    "Financial Services": ["Financial", "Banking", "Insurance", "Investment", "Real Estate"],
    "Consumer Discretionary": ["Consumer Discretionary", "Retail", "Automotive", "Media", "Hotels"],
    "Communication Services": ["Telecommunications", "Media", "Communication", "Internet"],
    "Industrials": ["Industrial", "Aerospace", "Transportation", "Construction", "Manufacturing"],
    "Consumer Staples": ["Consumer Staples", "Food", "Beverages", "Personal Products"],
    "Energy": ["Energy", "Oil", "Gas", "Renewable", "Utilities"],
    "Materials": ["Materials", "Chemicals", "Mining", "Paper", "Steel"],
    "Real Estate": ["Real Estate", "REIT"],
    "Utilities": ["Utilities", "Electric", "Water", "Gas"]
  };
  
  const keywords = sectorMappings[targetSector] || [];
  return keywords.some(keyword => 
    stockSector.toLowerCase().includes(keyword.toLowerCase())
  );
}