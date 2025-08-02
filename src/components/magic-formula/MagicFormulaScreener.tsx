import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, DollarSign } from "lucide-react";
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

export const MagicFormulaScreener = () => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);
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
      ]
    };

    return mockData[sector] || mockData["Technology"];
  };

  const calculateAllocation = (stock: Stock) => {
    const stockWeight = 1 / Math.min(stocks.length, 5); // Equal weight among top 5
    const allocation = investmentAmount * stockWeight;
    const shares = Math.floor(allocation / stock.price);
    return { allocation, shares };
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-normal tracking-tight">
            Magic Formula{" "}
            <span className="text-gradient font-medium">Stock Screener</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover high-quality, undervalued stocks using Joel Greenblatt's proven Magic Formula strategy
          </p>
        </div>

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
              <Label htmlFor="investment">Investment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="investment"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="pl-10"
                  min="1000"
                  step="1000"
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

        {/* Results */}
        {stocks.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Top Magic Formula Picks</h2>
              <Badge variant="secondary" className="px-3 py-1">
                {stocks.length} stocks found
              </Badge>
            </div>

            <div className="grid gap-4">
              {stocks.slice(0, 5).map((stock, index) => {
                const { allocation, shares } = calculateAllocation(stock);
                return (
                  <Card key={stock.symbol} className="border-white/10 bg-background/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold">#{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                              <p className="text-sm text-muted-foreground">{stock.name}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl font-bold">{formatCurrency(stock.price)}</p>
                          <p className="text-xs text-muted-foreground">Current Price</p>
                        </div>

                        <div className="text-center">
                          <p className="text-lg font-semibold text-primary">{(stock.earningsYield * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Earnings Yield</p>
                        </div>

                        <div className="text-center">
                          <p className="text-lg font-semibold text-green-400">{(stock.returnOnCapital * 100).toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Return on Capital</p>
                        </div>

                        <div className="text-center">
                          <p className="text-lg font-semibold">{formatCurrency(allocation)}</p>
                          <p className="text-xs text-muted-foreground">{shares} shares</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Portfolio Summary */}
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Portfolio Allocation Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(investmentAmount)}</p>
                    <p className="text-sm text-muted-foreground">Total Investment</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.min(stocks.length, 5)}</p>
                    <p className="text-sm text-muted-foreground">Selected Stocks</p>
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