import Navigation from "@/components/Navigation";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { MagicFormulaScreener } from "@/components/magic-formula/MagicFormulaScreener";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Target, BarChart3, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const Index = () => {
  const [showScreener, setShowScreener] = useState(false);

  if (showScreener) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <MagicFormulaScreener onBack={() => setShowScreener(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        
        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4 px-4 py-1.5 rounded-full glass"
            >
              <span className="text-sm font-medium">
                <Calculator className="w-4 h-4 inline-block mr-2" />
                Value investing made simple
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-normal tracking-tight leading-none">
              <TextGenerateEffect
                words="Beat the Market with"
                className="text-foreground"
              />
              <br />
              <span className="text-gradient font-medium">Magic Formula</span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Discover undervalued, high-quality stocks using Joel Greenblatt's proven quantitative investment strategy that has consistently outperformed the market.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                className="button-gradient group"
                onClick={() => setShowScreener(true)}
              >
                Start Screening Stocks
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="glass">
                View Methodology
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">17.9%</p>
                <p className="text-sm text-muted-foreground">Avg Annual Return</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">2</p>
                <p className="text-sm text-muted-foreground">Key Metrics</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">30+</p>
                <p className="text-sm text-muted-foreground">Years Backtested</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </section>

      <FeaturesSection />
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="container px-4 py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-background/80 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-12 text-center relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to start investing?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of investors who have already discovered the power of the Magic Formula strategy.
          </p>
          <Button 
            size="lg" 
            className="button-gradient"
            onClick={() => setShowScreener(true)}
          >
            Start Screening Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
