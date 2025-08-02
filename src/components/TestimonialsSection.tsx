"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";

const testimonials = [
  {
    name: "Michael Chen",
    role: "Value Investor",
    image: "https://avatars.githubusercontent.com/u/1234567?v=4",
    content: "The Magic Formula screener has completely transformed my investment approach. Finding undervalued, high-quality stocks has never been easier."
  },
  {
    name: "Sarah Johnson",
    role: "Portfolio Manager",
    image: "https://avatars.githubusercontent.com/u/2345678?v=4",
    content: "Joel Greenblatt's methodology implemented so elegantly. The real-time financial data and screening tools have significantly improved our fund performance."
  },
  {
    name: "David Wilson",
    role: "Financial Advisor",
    image: "https://avatars.githubusercontent.com/u/3456789?v=4",
    content: "The systematic approach to value investing this platform provides has helped my clients achieve consistent above-market returns. Absolutely essential tool."
  },
  {
    name: "Emily Zhang",
    role: "Quantitative Analyst",
    image: "https://avatars.githubusercontent.com/u/4567890?v=4",
    content: "The combination of earnings yield and return on capital calculations is perfectly executed. The backtesting results speak for themselves."
  },
  {
    name: "James Rodriguez",
    role: "Investment Strategist",
    image: "https://avatars.githubusercontent.com/u/5678901?v=4",
    content: "Magic Formula investing made simple and accessible. The sector-based screening and portfolio allocation features are incredibly powerful."
  },
  {
    name: "Lisa Thompson",
    role: "Pension Fund Manager",
    image: "https://avatars.githubusercontent.com/u/6789012?v=4",
    content: "The disciplined, systematic approach to stock selection has delivered exceptional results for our pension fund. A game-changer for institutional investing."
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 overflow-hidden bg-black">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-normal mb-4">Trusted by Investors</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of successful value investors using Magic Formula
          </p>
        </motion.div>

        <div className="relative flex flex-col antialiased">
          <div className="relative flex overflow-hidden py-4">
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={`${index}-1`} className="w-[400px] shrink-0 bg-black/40 backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-300 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-white/90">{testimonial.name}</h4>
                      <p className="text-sm text-white/60">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {testimonial.content}
                  </p>
                </Card>
              ))}
            </div>
            <div className="animate-marquee flex min-w-full shrink-0 items-stretch gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={`${index}-2`} className="w-[400px] shrink-0 bg-black/40 backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-300 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.image} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-white/90">{testimonial.name}</h4>
                      <p className="text-sm text-white/60">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {testimonial.content}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;