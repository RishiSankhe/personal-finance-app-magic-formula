import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");

interface AIRecommendationRequest {
  investmentAmount: number;
  sector: string;
  riskTolerance: string;
  timeHorizon: string;
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
      currentTrends: Array.isArray(marketNews) ? marketNews.slice(0, 5).map((news: any) => news.headline).join('. ') : 'Market analysis in progress',
      sectorFocus: sector,
      investmentAmount,
      timeHorizon,
      riskTolerance
    };

    // Use GPT-4 to analyze and recommend stocks
    const prompt = `As a financial advisor combining Magic Formula investing with AI market analysis, recommend exactly 5 stocks for a $${investmentAmount} investment in ${sector === "All Sectors" ? "any sector" : sector + " sector"}.

    Investment Profile:
    - Amount: $${investmentAmount}
    - Risk Tolerance: ${riskTolerance}
    - Time Horizon: ${timeHorizon}
    - Sector Focus: ${sector}

    Current Market Context: ${marketContext.currentTrends}

    Please provide exactly 5 stock recommendations in this JSON format:
    {
      "recommendations": [
        {
          "symbol": "STOCK",
          "recommendedShares": number,
          "allocationAmount": number (should sum to approximately ${investmentAmount}),
          "confidence": number (1-100),
          "reasoning": "detailed explanation combining Magic Formula metrics",
          "marketTrends": "current market trend analysis for this stock"
        }
      ],
      "marketSummary": "overall market analysis and strategy summary"
    }

    Focus on stocks with:
    - Strong earnings yield (low P/E ratios)
    - High return on invested capital
    - Quality business fundamentals
    - Favorable current market trends
    - Appropriate for ${riskTolerance} risk tolerance and ${timeHorizon} time horizon

    Ensure the 5 allocations sum to approximately $${investmentAmount}.`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert financial advisor specializing in Magic Formula investing with real-time market analysis. Always respond with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    // Parse AI response
    let aiRecommendations;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiRecommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Enhance recommendations with real stock data
    const enhancedRecommendations: AIStock[] = [];
    
    for (const rec of aiRecommendations.recommendations) {
      try {
        // Get real stock data from Finnhub
        const [profileResponse, quoteResponse] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${rec.symbol}&token=${FINNHUB_API_KEY}`),
          fetch(`https://finnhub.io/api/v1/quote?symbol=${rec.symbol}&token=${FINNHUB_API_KEY}`)
        ]);

        const [profileData, quoteData] = await Promise.all([
          profileResponse.json(),
          quoteResponse.json()
        ]);

        // Use real data if available, otherwise use AI estimates
        if (profileData.name && quoteData.c && quoteData.c > 0) {
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
          price: Math.round(rec.allocationAmount / rec.recommendedShares * 100) / 100,
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
        marketSummary: aiRecommendations.marketSummary,
        investmentAmount,
        sector,
        totalRecommendations: enhancedRecommendations.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('AI Recommendations Error:', error);
    
    // Return enhanced mock data as fallback
    const mockRecommendations: AIStock[] = [
      {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        price: 875.28,
        recommendedShares: Math.floor(15000 * 0.25 / 875.28),
        allocationAmount: 15000 * 0.25,
        confidence: 92,
        reasoning: "AI leader with strong Magic Formula metrics and positioned to benefit from continued AI adoption trends across industries.",
        marketTrends: "AI infrastructure demand driving exceptional growth momentum in data centers and cloud computing",
        magicFormulaScore: 87
      },
      {
        symbol: "PLTR",
        name: "Palantir Technologies Inc",
        price: 154.27,
        recommendedShares: Math.floor(15000 * 0.18 / 154.27),
        allocationAmount: 15000 * 0.18,
        confidence: 85,
        reasoning: "Government and enterprise AI contracts growing rapidly with improving profitability metrics and strong earnings yield.",
        marketTrends: "Enterprise AI adoption accelerating with strong government contract pipeline and commercial growth",
        magicFormulaScore: 91
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        price: 425.45,
        recommendedShares: Math.floor(15000 * 0.20 / 425.45),
        allocationAmount: 15000 * 0.20,
        confidence: 88,
        reasoning: "Dominant cloud platform with integrated AI services and strong Magic Formula fundamentals showing consistent profitability.",
        marketTrends: "Cloud computing growth accelerating with AI integration across Azure and Office 365",
        magicFormulaScore: 85
      },
      {
        symbol: "GOOGL",
        name: "Alphabet Inc Class A",
        price: 178.32,
        recommendedShares: Math.floor(15000 * 0.22 / 178.32),
        allocationAmount: 15000 * 0.22,
        confidence: 86,
        reasoning: "Search dominance with strong AI integration and attractive valuation metrics based on Magic Formula analysis.",
        marketTrends: "AI search integration and cloud growth driving revenue expansion",
        magicFormulaScore: 82
      },
      {
        symbol: "AMD",
        name: "Advanced Micro Devices Inc",
        price: 142.89,
        recommendedShares: Math.floor(15000 * 0.15 / 142.89),
        allocationAmount: 15000 * 0.15,
        confidence: 81,
        reasoning: "Strong competitor in AI chips with improving market share and efficient capital allocation.",
        marketTrends: "GPU market expansion driven by AI workloads and data center demand",
        magicFormulaScore: 79
      }
    ];

    return new Response(
      JSON.stringify({ 
        aiRecommendations: mockRecommendations,
        marketSummary: "Current market conditions favor AI-focused technology companies with strong fundamentals. The Magic Formula approach combined with AI market trends suggests focusing on companies with proven execution and growing market share in AI infrastructure and applications.",
        investmentAmount: 15000,
        sector: "All Sectors",
        totalRecommendations: 5,
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