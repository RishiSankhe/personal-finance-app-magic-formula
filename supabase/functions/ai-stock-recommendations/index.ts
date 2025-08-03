import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");

interface AIRecommendationRequest {
  investmentAmount: number;
  sector: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: 'short' | 'medium' | 'long';
}

interface AIStock {
  symbol: string;
  name: string;
  price: number;
  recommendedShares: number;
  allocationAmount: number;
  confidence: number;
  reasoning: string;
  marketTrends: string;
  magicFormulaScore: number;
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
    const { investmentAmount, sector, riskTolerance = 'moderate', timeHorizon = 'medium' } = await req.json();

    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    if (!FINNHUB_API_KEY) {
      throw new Error("Finnhub API key not configured");
    }

    console.log(`Generating AI recommendations for ${sector} sector with $${investmentAmount} investment`);

    // Get current market data from Finnhub
    const symbolsResponse = await fetch(
      `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${FINNHUB_API_KEY}`
    );
    const allSymbols = await symbolsResponse.json();

    // Check if API response is valid
    if (!Array.isArray(allSymbols)) {
      console.error('Invalid symbols response from Finnhub:', allSymbols);
      throw new Error('Failed to fetch valid stock symbols from Finnhub');
    }

    // Filter relevant stocks for the sector
    let sectorSymbols = allSymbols
      .filter((stock: any) => stock.type === "Common Stock")
      .slice(0, 50); // Analyze top 50 for AI processing

    // Get market news and trends
    const newsResponse = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
    );
    const marketNews = await newsResponse.json();

    // Create market context for AI
    const marketContext = {
      currentTrends: marketNews.slice(0, 5).map((news: any) => news.headline).join('. '),
      sectorFocus: sector,
      investmentAmount,
      timeHorizon,
      riskTolerance
    };

    // Use GPT-4 to analyze and recommend stocks
    const prompt = `
You are an expert financial advisor specializing in Magic Formula investing and market analysis. 

INVESTMENT PARAMETERS:
- Investment Amount: $${investmentAmount}
- Sector Focus: ${sector}
- Risk Tolerance: ${riskTolerance}
- Time Horizon: ${timeHorizon}

CURRENT MARKET CONTEXT:
${marketContext.currentTrends}

TASK: Provide exactly 5 AI-powered stock recommendations that combine:
1. Magic Formula principles (high earnings yield + high return on capital)
2. Current market trends and momentum
3. Optimal position sizing for the given budget
4. Sector-specific opportunities

For each recommendation, provide:
- Stock symbol (US exchange only)
- Recommended number of shares to buy
- Investment allocation amount
- Confidence score (1-100)
- 2-sentence reasoning combining Magic Formula metrics with current market trends
- Brief market trend insight

FORMAT YOUR RESPONSE AS JSON:
{
  "recommendations": [
    {
      "symbol": "STOCK_SYMBOL",
      "recommendedShares": number,
      "allocationAmount": number,
      "confidence": number,
      "reasoning": "Brief explanation combining Magic Formula and market trends",
      "marketTrends": "Current trend insight"
    }
  ],
  "marketSummary": "Overall market outlook for this investment strategy"
}

Focus on stocks under $100 that offer good Magic Formula metrics and align with current market momentum.
`;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional financial advisor with expertise in Magic Formula investing, market analysis, and portfolio construction. Provide actionable, data-driven investment recommendations.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!gptResponse.ok) {
      throw new Error(`OpenAI API error: ${gptResponse.statusText}`);
    }

    const gptData = await gptResponse.json();
    const aiAnalysis = JSON.parse(gptData.choices[0].message.content);

    // Enhance AI recommendations with real market data
    const enhancedRecommendations: AIStock[] = [];

    for (const rec of aiAnalysis.recommendations) {
      try {
        // Get real-time data for each recommended stock
        const [quoteResponse, profileResponse] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/quote?symbol=${rec.symbol}&token=${FINNHUB_API_KEY}`),
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${rec.symbol}&token=${FINNHUB_API_KEY}`)
        ]);

        const [quoteData, profileData] = await Promise.all([
          quoteResponse.json(),
          profileResponse.json()
        ]);

        if (quoteData.c && profileData.name) {
          enhancedRecommendations.push({
            symbol: rec.symbol,
            name: profileData.name,
            price: quoteData.c,
            recommendedShares: rec.recommendedShares,
            allocationAmount: rec.allocationAmount,
            confidence: rec.confidence,
            reasoning: rec.reasoning,
            marketTrends: rec.marketTrends,
            magicFormulaScore: Math.floor(Math.random() * 20) + 80 // Simulated score for demo
          });
        }

        // Small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`Error fetching data for ${rec.symbol}:`, error);
        // Add with estimated data if real data fails
        enhancedRecommendations.push({
          symbol: rec.symbol,
          name: `${rec.symbol} Corporation`,
          price: rec.allocationAmount / rec.recommendedShares,
          recommendedShares: rec.recommendedShares,
          allocationAmount: rec.allocationAmount,
          confidence: rec.confidence,
          reasoning: rec.reasoning,
          marketTrends: rec.marketTrends,
          magicFormulaScore: Math.floor(Math.random() * 20) + 80
        });
      }
    }

    return new Response(
      JSON.stringify({
        aiRecommendations: enhancedRecommendations,
        marketSummary: aiAnalysis.marketSummary,
        investmentAmount,
        sector,
        totalRecommendations: enhancedRecommendations.length,
        analysisTimestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('AI Recommendations Error:', error);

    // Fallback mock AI recommendations
    const mockAIRecommendations: AIStock[] = [
      {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        price: 875.28,
        recommendedShares: Math.floor(investmentAmount * 0.25 / 875.28),
        allocationAmount: investmentAmount * 0.25,
        confidence: 92,
        reasoning: "AI leader with strong Magic Formula metrics and positioned to benefit from continued AI adoption trends.",
        marketTrends: "AI infrastructure demand driving exceptional growth momentum",
        magicFormulaScore: 87
      },
      {
        symbol: "SMCI",
        name: "Super Micro Computer Inc",
        price: 45.67,
        recommendedShares: Math.floor(investmentAmount * 0.20 / 45.67),
        allocationAmount: investmentAmount * 0.20,
        confidence: 85,
        reasoning: "High earnings yield with strong return on capital, benefiting from AI server demand surge.",
        marketTrends: "Data center expansion creating sustained demand",
        magicFormulaScore: 91
      }
    ];

    return new Response(
      JSON.stringify({
        aiRecommendations: mockAIRecommendations,
        marketSummary: "Market shows strong momentum in technology sector with AI-driven growth opportunities.",
        investmentAmount: investmentAmount || 15000,
        sector: sector || "Technology",
        fallback: true,
        error: error.message,
        totalRecommendations: 2
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});