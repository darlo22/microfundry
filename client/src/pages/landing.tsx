import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, Shield, Zap, Users, ArrowRight, DollarSign, BarChart3, Target } from "lucide-react";
import OnboardingModal from "@/components/modals/onboarding-modal";

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  useEffect(() => {
    document.title = 'Fundry - Micro Investment Platform';
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.userType === 'founder') {
        navigate('/founder-dashboard');
      } else {
        navigate('/investor-dashboard');
      }
    } else {
      setIsOnboardingOpen(true);
    }
  };

  const stats = [
    { value: "$2.4M+", label: "Total Raised", icon: DollarSign },
    { value: "150+", label: "Active Campaigns", icon: BarChart3 },
    { value: "500+", label: "Investors", icon: Users },
    { value: "95%", label: "Success Rate", icon: Target }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Smart Investment Matching",
      description: "AI-powered algorithm connects startups with relevant investors based on sector, funding stage, and investment preferences."
    },
    {
      icon: Shield,
      title: "Secure SAFE Agreements",
      description: "Industry-standard Simple Agreement for Future Equity with automated legal documentation and investor protection."
    },
    {
      icon: Zap,
      title: "Investor Reachout",
      description: "Comprehensive email outreach system for connecting founders with potential investors through targeted campaigns."
    },
    {
      icon: Users,
      title: "Community Network",
      description: "Access to a vibrant community of entrepreneurs, mentors, and investors fostering collaboration and growth."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Fundry</span>
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
                <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</Link>
                <Link href="/browse-campaigns" className="text-gray-600 hover:text-gray-900">Browse</Link>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {user?.firstName}</span>
                  <Button 
                    onClick={() => navigate(user?.userType === 'founder' ? '/founder-dashboard' : '/investor-dashboard')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Button variant="ghost" onClick={() => setIsOnboardingOpen(true)}>
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted} className="bg-orange-600 hover:bg-orange-700">
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-orange-100 text-orange-800 hover:bg-orange-200">
            Now Live: Micro Investment Platform
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Fund the Next Big
            <span className="block bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Startup Revolution
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect visionary founders with smart investors. Start with as little as $25 
            and be part of the next generation of successful startups.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3"
            >
              Start Investing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setIsLearnMoreOpen(true)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50 text-lg px-8 py-3"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-sm bg-white/80">
                  <CardContent className="p-6">
                    <Icon className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Fundry?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with proven investment strategies 
              to create the perfect environment for startup funding.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 border-0 shadow-lg bg-white/80 hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-orange-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of investors and founders building the future together.
          </p>
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="text-xl font-bold">Fundry</span>
              </div>
              <p className="text-gray-400">
                Empowering the next generation of startups through smart micro-investments.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/browse-campaigns" className="hover:text-white">Browse Campaigns</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/success-stories" className="hover:text-white">Success Stories</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms-of-use" className="hover:text-white">Terms of Use</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/investment-disclaimer" className="hover:text-white">Investment Disclaimer</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Fundry. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <OnboardingModal 
        isOpen={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)} 
      />

      <Dialog open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>How Fundry Works</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">For Investors</h3>
              <p className="text-gray-600 mb-4">
                Start investing with as little as $25. Browse verified startup campaigns, 
                review business plans, and invest in companies you believe in.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Pricing Structure</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Free for investments under $1,000</li>
                  <li>• 5% platform fee for investments above $1,000</li>
                  <li>• No hidden fees or subscription costs</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">For Founders</h3>
              <p className="text-gray-600">
                Create compelling campaigns, reach thousands of potential investors, 
                and raise capital for your startup with transparent terms and secure SAFE agreements.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}