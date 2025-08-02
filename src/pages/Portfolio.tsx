import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Plus, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  shares?: number;
  value?: number;
}

const Portfolio = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [portfolio, setPortfolio] = useState<Stock[]>([
    { symbol: "AAPL", name: "Apple Inc.", price: 175.50, change: 2.30, changePercent: 1.33, shares: 10, value: 1755 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 350.20, change: -1.80, changePercent: -0.51, shares: 5, value: 1751 },
  ]);

  const [availableStocks] = useState<Stock[]>([
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 125.30, change: 3.20, changePercent: 2.62 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 145.80, change: -0.90, changePercent: -0.61 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 250.40, change: 8.70, changePercent: 3.60 },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 450.60, change: 12.30, changePercent: 2.81 },
    { symbol: "META", name: "Meta Platforms Inc.", price: 320.90, change: -2.40, changePercent: -0.74 },
    { symbol: "NFLX", name: "Netflix Inc.", price: 420.15, change: 5.60, changePercent: 1.35 },
  ]);

  const filteredStocks = availableStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = portfolio.reduce((sum, stock) => sum + (stock.value || 0), 0);
  const totalChange = portfolio.reduce((sum, stock) => sum + (stock.change * (stock.shares || 0)), 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const addToPortfolio = (stock: Stock) => {
    const shares = Math.floor(Math.random() * 20) + 1; // Random shares for demo
    const newStock = { ...stock, shares, value: stock.price * shares };
    setPortfolio([...portfolio, newStock]);
  };

  const removeFromPortfolio = (symbol: string) => {
    setPortfolio(portfolio.filter(stock => stock.symbol !== symbol));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container px-4 py-8 pt-24">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Portfolio</h1>
            <p className="text-muted-foreground">Build and manage your investment portfolio</p>
          </div>

          {/* Portfolio Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Change</p>
                  <p className={`text-2xl font-bold flex items-center gap-1 ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    ${Math.abs(totalChange).toFixed(2)} ({totalChangePercent.toFixed(2)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Holdings</p>
                  <p className="text-2xl font-bold">{portfolio.length} stocks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Holdings */}
            <Card>
              <CardHeader>
                <CardTitle>Current Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No stocks in portfolio yet</p>
                  ) : (
                    portfolio.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{stock.symbol}</span>
                            <Badge variant="secondary">{stock.shares} shares</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{stock.name}</p>
                          <p className="text-sm">
                            ${stock.price} × {stock.shares} = ${stock.value?.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm flex items-center gap-1 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {stock.changePercent.toFixed(2)}%
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromPortfolio(stock.symbol)}
                            className="text-red-600 hover:text-red-700 mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add Stocks */}
            <Card>
              <CardHeader>
                <CardTitle>Add Stocks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stocks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredStocks.map((stock) => {
                      const isInPortfolio = portfolio.some(p => p.symbol === stock.symbol);
                      return (
                        <div key={stock.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{stock.symbol}</span>
                              <span className={`text-sm flex items-center gap-1 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {stock.changePercent.toFixed(2)}%
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{stock.name}</p>
                            <p className="text-sm font-medium">${stock.price}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToPortfolio(stock)}
                            disabled={isInPortfolio}
                            className="flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            {isInPortfolio ? "Added" : "Add"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio;