import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  earningsYield: number;
  returnOnCapital: number;
  magicFormulaRank: number;
  sector: string;
  marketCap: number;
}

interface MagicFormulaScreenerProps {
  onBack?: () => void;
}

export const MagicFormulaScreener = ({ onBack }: MagicFormulaScreenerProps) => {
  const [selectedSector, setSelectedSector] = useState<string>("All Sectors");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
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
      const response = await fetch('/api/magic-formula-screener', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sector: selectedSector,
          limit: 10
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();
      setStocks(data.stocks || []);
      
      toast({
        title: "Screener Complete",
        description: `Found ${data.stocks?.length || 0} stocks matching Magic Formula criteria`,
      });
    } catch (error) {
      console.error('Screener error:', error);
      toast({
        title: "Error",
        description: "Failed to run screener. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to mock data for demo
      setStocks(getMockStocks(selectedSector));
    } finally {
      setLoading(false);
    }
  };

  const getMockStocks = (sector: string): Stock[] => {
    const mockData: { [key: string]: Stock[] } = {
      "Technology": [
        { symbol: "AAPL", name: "Apple Inc.", price: 192.53, earningsYield: 0.058, returnOnCapital: 0.284, magicFormulaRank: 1, sector: "Technology", marketCap: 3000000000000 },
        { symbol: "MSFT", name: "Microsoft Corp.", price: 412.64, earningsYield: 0.032, returnOnCapital: 0.185, magicFormulaRank: 2, sector: "Technology", marketCap: 2800000000000 },
        { symbol: "GOOGL", name: "Alphabet Inc.", price: 166.41, earningsYield: 0.041, returnOnCapital: 0.142, magicFormulaRank: 3, sector: "Technology", marketCap: 2100000000000 },
      ],
      "Healthcare": [
        { symbol: "JNJ", name: "Johnson & Johnson", price: 158.42, earningsYield: 0.045, returnOnCapital: 0.128, magicFormulaRank: 1, sector: "Healthcare", marketCap: 425000000000 },
        { symbol: "PFE", name: "Pfizer Inc.", price: 28.95, earningsYield: 0.089, returnOnCapital: 0.095, magicFormulaRank: 2, sector: "Healthcare", marketCap: 163000000000 },
      ],
      "Energy": [
        { symbol: "XOM", name: "Exxon Mobil Corp.", price: 108.45, earningsYield: 0.072, returnOnCapital: 0.156, magicFormulaRank: 1, sector: "Energy", marketCap: 425000000000 },
        { symbol: "CVX", name: "Chevron Corp.", price: 159.32, earningsYield: 0.065, returnOnCapital: 0.142, magicFormulaRank: 2, sector: "Energy", marketCap: 315000000000 },
      ]
    };

    return mockData[sector] || mockData["Technology"];
  };

  const getStockWriteup = (stock: Stock) => {
    const writeups: { [key: string]: string } = {
      "AAPL": "Strong fundamentals with consistent cash flow generation and dominant market position in consumer electronics. High return on capital indicates efficient business operations and excellent management execution.",
      "MSFT": "Exceptional capital efficiency driven by cloud computing dominance and software subscription model. Strong competitive moats in enterprise software create sustainable competitive advantages.",
      "GOOGL": "Digital advertising monopoly with high returns on invested capital. Strong free cash flow generation supports long-term value creation and significant market share in search.",
      "JNJ": "Diversified healthcare giant with stable earnings and strong brand portfolio. Consistent dividend payments and defensive characteristics make it ideal for conservative portfolios.",
      "PFE": "Undervalued pharmaceutical company with strong pipeline and high earnings yield. Recent market conditions create attractive entry point for value investors.",
      "XOM": "Energy sector leader with improved capital discipline and strong cash flow generation. Benefits from higher oil prices and efficient operations.",
      "CVX": "Well-managed oil company with consistent dividend payments and strong balance sheet. Conservative approach to capital allocation creates shareholder value."
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          )}
          <div className="text-center flex-1">
            <h1 className="text-5xl md:text-6xl font-normal tracking-tight">
              Magic Formula{" "}
              <span className="text-gradient font-medium">Stock Screener</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              Discover high-quality, undervalued stocks using Joel Greenblatt's proven Magic Formula strategy
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Controls */}
        <Card className="border-white/10 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Screening Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Results */}
        {stocks.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Top Magic Formula Recommendations</h2>
              <Badge variant="secondary" className="px-3 py-1">
                {stocks.length} stocks found in {selectedSector}
              </Badge>
            </div>

            <div className="grid gap-6">
              {stocks.slice(0, 10).map((stock, index) => (
                <Card key={stock.symbol} className="border-white/10 bg-background/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Stock Info */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl">{stock.symbol}</h3>
                            <p className="text-muted-foreground">{stock.name}</p>
                            <p className="text-sm text-muted-foreground">Market Cap: {formatMarketCap(stock.marketCap)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold">{formatCurrency(stock.price)}</p>
                            <p className="text-xs text-muted-foreground">Current Price</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-primary">{(stock.earningsYield * 100).toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">Earnings Yield</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-green-400">{(stock.returnOnCapital * 100).toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">Return on Capital</p>
                          </div>
                        </div>
                      </div>

                      {/* Investment Thesis */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg">Why Invest?</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {getStockWriteup(stock)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Magic Formula Rank: #{stock.magicFormulaRank}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {stock.sector}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary Stats */}
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Screening Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{stocks.length}</p>
                    <p className="text-sm text-muted-foreground">Stocks Found</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedSector}</p>
                    <p className="text-sm text-muted-foreground">Target Sector</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {stocks.length > 0 ? (stocks.reduce((sum, stock) => sum + stock.earningsYield, 0) / stocks.length * 100).toFixed(1) + '%' : '0%'}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Earnings Yield</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};