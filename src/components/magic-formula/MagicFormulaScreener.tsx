import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Target, TrendingUp, DollarSign, Briefcase, Bot, Brain, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  earningsYield: number;
  returnOnCapital: number;
  magicFormulaRank: number;
  overallRank: number;
  sector: string;
  marketCap: number;
  peRatio?: number;
  eps?: number;
  revenue?: number;
  sharesYouCanBuy: number;
  investmentAllocation: number;
  country: string;
  exchange: string;
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

interface AIResults {
  aiRecommendations: AIStock[];
  marketSummary: string;
  investmentAmount: number;
  sector: string;
  totalRecommendations: number;
}

interface ScreenerResults {
  generalRecommendations: Stock[];
  priceOptimizedRecommendations: Stock[];
  investmentAmount: number;
  sector: string;
  totalAnalyzed: number;
  totalInMarket: number;
}

interface MagicFormulaScreenerProps {
  onBack?: () => void;
}

export const MagicFormulaScreener = ({ onBack }: MagicFormulaScreenerProps) => {
  const [selectedSector, setSelectedSector] = useState<string>("All Sectors");
  const [investmentAmount, setInvestmentAmount] = useState<number>(15000);
  const [riskTolerance, setRiskTolerance] = useState<string>("moderate");
  const [timeHorizon, setTimeHorizon] = useState<string>("medium");
  const [results, setResults] = useState<ScreenerResults | null>(null);
  const [aiResults, setAiResults] = useState<AIResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  const sectors = [
    "All Sectors",
    "Technology",
    "Healthcare", 
    "Financial Services",
    "Consumer Discretionary",
    "Communication Services",
    "Industrials",
    "Consumer Staples",
    "Energy",
    "Materials",
    "Real Estate",
    "Utilities"
  ];

  const runScreener = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('magic-formula-screener', {
        body: {
          sector: selectedSector,
          investmentAmount,
          limit: 20
        }
      });

      if (error) {
        throw error;
      }

      setResults(data);
      
      toast({
        title: "Screener Complete",
        description: `Found ${data.totalAnalyzed} stocks from ${data.totalInMarket} market stocks`,
      });
    } catch (error) {
      console.error('Screener error:', error);
      toast({
        title: "Error",
        description: "Failed to run screener. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to mock data for demo
      setResults(getMockResults(selectedSector, investmentAmount));
    } finally {
      setLoading(false);
    }
  };

  const runAIRecommendations = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-stock-recommendations', {
        body: {
          investmentAmount,
          sector: selectedSector,
          riskTolerance,
          timeHorizon
        }
      });

      if (error) {
        throw error;
      }

      setAiResults(data);
      
      toast({
        title: "AI Analysis Complete",
        description: `Generated ${data.totalRecommendations} AI-powered recommendations`,
      });
    } catch (error) {
      console.error('AI Recommendations error:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI recommendations. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to mock AI data
      setAiResults(getMockAIResults(selectedSector, investmentAmount));
    } finally {
      setAiLoading(false);
    }
  };

  const getMockAIResults = (sector: string, amount: number): AIResults => {
    const mockAIStocks: AIStock[] = [
      {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        price: 875.28,
        recommendedShares: Math.floor(amount * 0.25 / 875.28),
        allocationAmount: amount * 0.25,
        confidence: 92,
        reasoning: "AI leader with strong Magic Formula metrics and positioned to benefit from continued AI adoption trends across industries.",
        marketTrends: "AI infrastructure demand driving exceptional growth momentum in data centers and cloud computing",
        magicFormulaScore: 87
      },
      {
        symbol: "PLTR",
        name: "Palantir Technologies Inc",
        price: 154.27,
        recommendedShares: Math.floor(amount * 0.18 / 154.27),
        allocationAmount: amount * 0.18,
        confidence: 85,
        reasoning: "Government and enterprise AI contracts growing rapidly with improving profitability metrics and strong earnings yield.",
        marketTrends: "Enterprise AI adoption accelerating with strong government contract pipeline and commercial growth",
        magicFormulaScore: 91
      },
      {
        symbol: "SMCI",
        name: "Super Micro Computer Inc",
        price: 45.67,
        recommendedShares: Math.floor(amount * 0.20 / 45.67),
        allocationAmount: amount * 0.20,
        confidence: 78,
        reasoning: "High earnings yield with strong return on capital, directly benefiting from AI server demand surge.",
        marketTrends: "Data center expansion creating sustained demand for high-performance computing solutions",
        magicFormulaScore: 83
      },
      {
        symbol: "AMD",
        name: "Advanced Micro Devices Inc",
        price: 142.89,
        recommendedShares: Math.floor(amount * 0.20 / 142.89),
        allocationAmount: amount * 0.20,
        confidence: 81,
        reasoning: "Strong competitor in AI chips with improving market share and efficient capital allocation.",
        marketTrends: "GPU market expansion driven by AI workloads and data center demand",
        magicFormulaScore: 85
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        price: 425.45,
        recommendedShares: Math.floor(amount * 0.17 / 425.45),
        allocationAmount: amount * 0.17,
        confidence: 88,
        reasoning: "Dominant cloud platform with integrated AI services and strong Magic Formula fundamentals showing consistent profitability.",
        marketTrends: "Cloud computing growth accelerating with AI integration across Azure and Office 365",
        magicFormulaScore: 79
      }
    ];

    return {
      aiRecommendations: mockAIStocks,
      marketSummary: "Current market conditions favor AI-focused technology companies with strong fundamentals. The Magic Formula approach combined with AI market trends suggests focusing on companies with proven execution and growing market share in AI infrastructure and applications.",
      investmentAmount: amount,
      sector: sector,
      totalRecommendations: 5
    };
  };

  const getMockResults = (sector: string, amount: number): ScreenerResults => {
    const mockStocks: Stock[] = [
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
        sharesYouCanBuy: Math.floor((amount * 0.2) / 28.45),
        investmentAllocation: Math.floor((amount * 0.2) / 28.45) * 28.45,
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
        sharesYouCanBuy: Math.floor((amount * 0.2) / 45.67),
        investmentAllocation: Math.floor((amount * 0.2) / 45.67) * 45.67,
        country: "US",
        exchange: "NASDAQ"
      },
      { 
        symbol: "SPNT", 
        name: "SiriusPoint Ltd", 
        price: 12.34, 
        earningsYield: 0.145, 
        returnOnCapital: 0.134, 
        magicFormulaRank: 3, 
        overallRank: 31,
        sector: "Financial Services", 
        marketCap: 890000000,
        peRatio: 6.9,
        eps: 1.79,
        revenue: 2100000000,
        sharesYouCanBuy: Math.floor((amount * 0.2) / 12.34),
        investmentAllocation: Math.floor((amount * 0.2) / 12.34) * 12.34,
        country: "US",
        exchange: "NYSE"
      },
      { 
        symbol: "COOP", 
        name: "Mr. Cooper Group Inc", 
        price: 89.23, 
        earningsYield: 0.095, 
        returnOnCapital: 0.142, 
        magicFormulaRank: 4, 
        overallRank: 38,
        sector: "Financial Services", 
        marketCap: 6500000000,
        peRatio: 10.5,
        eps: 8.50,
        revenue: 3200000000,
        sharesYouCanBuy: Math.floor((amount * 0.18) / 89.23),
        investmentAllocation: Math.floor((amount * 0.18) / 89.23) * 89.23,
        country: "US",
        exchange: "NASDAQ"
      },
      { 
        symbol: "BYND", 
        name: "Beyond Meat Inc", 
        price: 6.78, 
        earningsYield: 0.156, 
        returnOnCapital: 0.098, 
        magicFormulaRank: 5, 
        overallRank: 67,
        sector: "Consumer Staples", 
        marketCap: 450000000,
        peRatio: 6.4,
        eps: 1.06,
        revenue: 410000000,
        sharesYouCanBuy: Math.floor((amount * 0.15) / 6.78),
        investmentAllocation: Math.floor((amount * 0.15) / 6.78) * 6.78,
        country: "US",
        exchange: "NASDAQ"
      }
    ];

    return {
      generalRecommendations: mockStocks,
      priceOptimizedRecommendations: mockStocks.filter(stock => stock.price < 50),
      investmentAmount: amount,
      sector: sector,
      totalAnalyzed: 50,
      totalInMarket: 8000
    };
  };

  const getStockWriteup = (stock: Stock) => {
    const writeups: { [key: string]: string } = {
      "NVEI": "Fintech company with strong growth potential and efficient capital allocation. High earnings yield suggests market undervaluation.",
      "RICK": "Unique hospitality business with consistent cash flow generation and strong return metrics. Defensive business model with recurring revenue.",
      "SPNT": "Specialty insurance company with attractive valuations and solid fundamentals. Strong balance sheet and experienced management team."
    };
    
    return writeups[stock.symbol] || `Strong Magic Formula candidate with attractive earnings yield of ${(stock.earningsYield * 100).toFixed(1)}% and solid return on capital of ${(stock.returnOnCapital * 100).toFixed(1)}%. The combination of these metrics suggests an undervalued, quality business with efficient management.`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toFixed(0)}`;
  };

  const renderStockCard = (stock: Stock, index: number, isOptimized: boolean = false) => (
    <Card key={stock.symbol} className="border-white/10 bg-background/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold">#{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-xl">{stock.symbol}</h3>
                  <Badge variant="outline" className="text-xs">
                    Overall Rank: #{stock.overallRank}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{stock.name}</p>
                <p className="text-sm text-muted-foreground">
                  {stock.exchange} • {stock.country} • {formatMarketCap(stock.marketCap)}
                </p>
              </div>
            </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stock.price)}</p>
                  <p className="text-xs text-muted-foreground">Current Price</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">{(stock.earningsYield * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Earnings Yield</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">{(stock.returnOnCapital * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Return on Capital</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-blue-400">{stock.peRatio ? stock.peRatio.toFixed(1) : 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">P/E Ratio</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-400">#{stock.overallRank}</p>
                  <p className="text-xs text-muted-foreground">Market Rank</p>
                </div>
              </div>
            
            {/* Investment Allocation */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h5 className="text-sm font-medium mb-2">Your Investment Allocation</h5>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-green-400">{stock.sharesYouCanBuy}</p>
                  <p className="text-xs text-muted-foreground">Shares You Can Buy</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-400">{formatCurrency(stock.investmentAllocation)}</p>
                  <p className="text-xs text-muted-foreground">Allocation Amount</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-400">{((stock.investmentAllocation / investmentAmount) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Portfolio Weight</p>
                </div>
              </div>
            </div>

            {/* Additional Financial Metrics */}
            {(stock.eps || stock.revenue) && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <h5 className="text-sm font-medium mb-2">Key Financials</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {stock.eps && (
                    <div className="text-center">
                      <p className="font-semibold">${stock.eps.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">EPS</p>
                    </div>
                  )}
                  {stock.revenue && (
                    <div className="text-center">
                      <p className="font-semibold">{formatMarketCap(stock.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Investment Thesis */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">
              {isOptimized ? "Price-Optimized Pick" : "Why Invest?"}
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {getStockWriteup(stock)}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                Magic Formula Rank: #{stock.magicFormulaRank}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stock.sector}
              </Badge>
              {isOptimized && (
                <Badge className="text-xs bg-green-100 text-green-800">
                  Optimal for ${formatCurrency(investmentAmount).replace('$', '').replace('.00', '')} Budget
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAIStockCard = (stock: AIStock, index: number) => (
    <Card key={stock.symbol} className="border-white/10 bg-background/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-xl">{stock.symbol}</h3>
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                    AI Confidence: {stock.confidence}%
                  </Badge>
                </div>
                <p className="text-muted-foreground">{stock.name}</p>
                <p className="text-sm text-muted-foreground">
                  Magic Formula Score: {stock.magicFormulaScore}/100
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stock.price)}</p>
                <p className="text-xs text-muted-foreground">Current Price</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-400">{stock.recommendedShares}</p>
                <p className="text-xs text-muted-foreground">AI Recommended Shares</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-blue-400">{formatCurrency(stock.allocationAmount)}</p>
                <p className="text-xs text-muted-foreground">Allocation Amount</p>
              </div>
            </div>
            
            {/* AI Analysis */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-muted/50">
              <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Market Trend Analysis
              </h5>
              <p className="text-sm text-foreground">{stock.marketTrends}</p>
            </div>
          </div>

          {/* AI Investment Reasoning */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              AI Investment Reasoning
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {stock.reasoning}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                AI-Powered Pick #{index + 1}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Portfolio Weight: {((stock.allocationAmount / investmentAmount) * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="bg-gradient-to-br from-background via-background to-background/80 p-6 pt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Back Button at Top */}
          {onBack && (
            <div className="flex justify-start">
              <Button variant="outline" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          )}
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-normal tracking-tight">
              Magic Formula{" "}
              <span className="text-gradient font-medium">Stock Screener</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              Discover undervalued stocks with AI-powered insights and investment optimization
            </p>
          </div>

          <Tabs defaultValue="screener" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="screener" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Magic Formula Screener
              </TabsTrigger>
              <TabsTrigger value="ai-recommendations" className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI-Powered Recommendations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="screener" className="space-y-8">
              {/* Controls */}
              <Card className="border-white/10 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Screening Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="investment-amount">Intended Investment Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="investment-amount"
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                        placeholder="15000"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Select value={selectedSector} onValueChange={setSelectedSector}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={runScreener}
                      disabled={loading}
                      className="button-gradient w-full"
                      size="lg"
                    >
                      {loading ? "Screening..." : "Run Screen"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Traditional Screener Results */}
              {results && (
                <div className="space-y-8">
                  {/* General Recommendations */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Top Magic Formula Rankings</h2>
                      <Badge variant="secondary" className="px-3 py-1">
                        {results.generalRecommendations.length} stocks • {results.sector}
                      </Badge>
                    </div>

                    <div className="grid gap-6">
                      {results.generalRecommendations.slice(0, 5).map((stock, index) => 
                        renderStockCard(stock, index, false)
                      )}
                    </div>
                  </div>

                  {/* Price-Optimized Recommendations */}
                  {results.priceOptimizedRecommendations.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Price-Optimized for Your Budget</h2>
                        <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-800">
                          {results.priceOptimizedRecommendations.length} optimal picks
                        </Badge>
                      </div>

                      <div className="grid gap-6">
                        {results.priceOptimizedRecommendations.slice(0, 5).map((stock, index) => 
                          renderStockCard(stock, index, true)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Summary Stats */}
                  <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Screening Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{results.totalAnalyzed}</p>
                          <p className="text-sm text-muted-foreground">Stocks Analyzed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{formatMarketCap(results.totalInMarket)}</p>
                          <p className="text-sm text-muted-foreground">Total Market Stocks</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{formatCurrency(results.investmentAmount)}</p>
                          <p className="text-sm text-muted-foreground">Investment Budget</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-400">
                            {results.generalRecommendations.length > 0 ? 
                              (results.generalRecommendations.reduce((sum, stock) => sum + stock.earningsYield, 0) / results.generalRecommendations.length * 100).toFixed(1) + '%' : 
                              '0%'
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">Avg Earnings Yield</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai-recommendations" className="space-y-8">
              {/* AI Controls */}
              <Card className="border-white/10 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    AI Analysis Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ai-investment-amount">Investment Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="ai-investment-amount"
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                        placeholder="15000"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-sector">Sector Focus</Label>
                    <Select value={selectedSector} onValueChange={setSelectedSector}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
                    <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time-horizon">Time Horizon</Label>
                    <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time horizon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (under 1 year)</SelectItem>
                        <SelectItem value="medium">Medium (1-5 years)</SelectItem>
                        <SelectItem value="long">Long (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Button 
                    onClick={runAIRecommendations}
                    disabled={aiLoading}
                    className="button-gradient w-full"
                    size="lg"
                  >
                    {aiLoading ? (
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 animate-spin" />
                        AI Analyzing Market...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Generate AI Recommendations
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* AI Results */}
              {aiResults && (
                <div className="space-y-8">
                  {/* Market Summary */}
                  <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        AI Market Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-purple-800 leading-relaxed">{aiResults.marketSummary}</p>
                    </CardContent>
                  </Card>

                  {/* AI Recommendations */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Bot className="w-6 h-6 text-purple-600" />
                        AI-Powered Stock Recommendations
                      </h2>
                      <Badge className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        {aiResults.totalRecommendations} AI picks • {aiResults.sector}
                      </Badge>
                    </div>

                    <div className="grid gap-6">
                      {aiResults.aiRecommendations.map((stock, index) => 
                        renderAIStockCard(stock, index)
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};