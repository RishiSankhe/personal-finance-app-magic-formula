import { Calculator, TrendingUp, Shield, BarChart3 } from "lucide-react";

export const features = [
  {
    title: "Magic Formula Calculator",
    description: "Advanced screening engine that ranks stocks based on earnings yield and return on capital using Joel Greenblatt's proven methodology.",
    icon: <Calculator className="w-6 h-6" />,
    image: "/lovable-uploads/86329743-ee49-4f2e-96f7-50508436273d.png"
  },
  {
    title: "Portfolio Optimization",
    description: "Smart allocation algorithms that help you build a diversified portfolio of high-quality value stocks across different sectors.",
    icon: <TrendingUp className="w-6 h-6" />,
    image: "/lovable-uploads/7335619d-58a9-41ad-a233-f7826f56f3e9.png"
  },
  {
    title: "Risk Management",
    description: "Comprehensive risk analysis tools with position sizing, sector allocation limits, and portfolio rebalancing recommendations.",
    icon: <Shield className="w-6 h-6" />,
    image: "/lovable-uploads/b6436838-5c1a-419a-9cdc-1f9867df073d.png"
  },
  {
    title: "Performance Analytics",
    description: "Track your Magic Formula portfolio performance with detailed analytics, backtesting results, and benchmark comparisons.",
    icon: <BarChart3 className="w-6 h-6" />,
    image: "/lovable-uploads/79f2b901-8a4e-42a5-939f-fae0828e0aef.png"
  }
];