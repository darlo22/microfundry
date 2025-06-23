import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, Rocket, Shield, Users, BarChart, Smartphone, Headphones, Settings } from "lucide-react";
import OnboardingModal from "@/components/modals/onboarding-modal";
import LearnMoreModal from "@/components/modals/learn-more-modal";
import InvestorInfoModal from "@/components/modals/investor-info-modal";
import Footer from "@/components/layout/footer";
import { FundryLogo } from "@/components/ui/fundry-logo";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  const [defaultUserType, setDefaultUserType] = useState<"founder" | "investor" | undefined>(undefined);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType === 'founder') {
        window.location.href = '/founder-dashboard';
      } else if (user.userType === 'investor') {
        window.location.href = '/investor-dashboard';
      }
    }
  }, [isAuthenticated, user]);

  // Check URL parameters to auto-open investor onboarding
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoInvest = urlParams.get('invest');
    const userType = urlParams.get('type');
    
    if (autoInvest === 'true' && userType === 'investor') {
      setAuthMode("signup");
      setDefaultUserType("investor");
      setShowAuthModal(true);
      // Clean up URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleGetStarted = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  const handleInvestorInfo = () => {
    setShowInvestorModal(true);
  };

  if (isAuthenticated && user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <FundryLogo className="h-8" />
              <div className="hidden md:flex space-x-8">
                <Link href="#how-it-works" className="text-gray-700 hover:text-fundry-orange">
                  How it Works
                </Link>
                <Link href="#for-founders" className="text-gray-700 hover:text-fundry-orange">
                  For Founders
                </Link>
                <Link href="#for-investors" className="text-gray-700 hover:text-fundry-orange">
                  For Investors
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="text-gray-600 border-gray-300"
                onClick={() => window.location.href = '/admin-login'}
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Centre
              </Button>
              <Button 
                variant="outline" 
                className="text-gray-700"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button 
                className="bg-fundry-orange hover:bg-orange-600 text-white"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-fundry-navy text-white min-h-[600px] flex items-center">        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Raise Your First{" "}
                <span className="text-fundry-orange">$5,000</span>{" "}
                From Friends & Family
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed max-w-4xl">
                Simple micro-investment platform for early-stage startups. Create campaigns, 
                share private links, and collect investments with automated SAFE agreements.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-fundry-orange hover:bg-orange-600 text-lg px-8 py-4"
              >
                Start Fundraising
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowLearnMoreModal(true)}
                className="border-2 border-white text-fundry-navy bg-white hover:bg-gray-100 hover:text-fundry-navy text-lg px-8 py-4"
              >
                Learn More
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-fundry-orange">$2.5M+</div>
                <div className="text-sm text-blue-200">Total Raised</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-fundry-orange">1,200+</div>
                <div className="text-sm text-blue-200">Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-fundry-orange">98%</div>
                <div className="text-sm text-blue-200">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Raise Capital</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Simple, secure, and compliant micro-investment platform designed for early-stage startups.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-fundry-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-fundry-orange" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quick Campaign Setup</h3>
                <p className="text-gray-600">Create professional fundraising campaigns in minutes with our intuitive builder.</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-fundry-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-fundry-navy" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Automated SAFE Agreements</h3>
                <p className="text-gray-600">Legally compliant investment documents generated automatically for every transaction.</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartLine className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-gray-600">Track your campaign performance with detailed insights and investor engagement metrics.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Fundry Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to start raising capital from your network</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-fundry-orange rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Create Your Campaign</h3>
              <p className="text-gray-600">Set up your fundraising campaign with your pitch, goals, and investment terms in minutes.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-fundry-navy rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Share with Your Network</h3>
              <p className="text-gray-600">Send private investment links to friends, family, and potential investors.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Collect Investments</h3>
              <p className="text-gray-600">Automated payment processing and SAFE agreement generation for seamless investing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Founders */}
      <section id="for-founders" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Built for Founders</h2>
              <p className="text-xl text-gray-600 mb-8">
                Everything you need to raise your first round of capital from people who believe in your vision.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-fundry-orange rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Professional Campaign Pages</h3>
                    <p className="text-gray-600">Create compelling investment opportunities that showcase your startup's potential.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-fundry-orange rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Investor Management</h3>
                    <p className="text-gray-600">Track investors, manage communications, and monitor campaign performance.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-fundry-orange rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Legal Compliance</h3>
                    <p className="text-gray-600">Automated SAFE agreements ensure all investments are properly documented.</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="mt-8 bg-fundry-orange hover:bg-orange-600" 
                size="lg"
                onClick={handleGetStarted}
              >
                Start Your Campaign
              </Button>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="space-y-4">
                <div className="bg-white rounded p-4 border-l-4 border-fundry-orange">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">TechFlow Solutions</span>
                    <span className="text-green-600 font-semibold">$4,800 raised</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">AI-powered workflow automation</p>
                </div>
                
                <div className="bg-white rounded p-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">GreenEnergy Co</span>
                    <span className="text-green-600 font-semibold">$5,000 raised</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Sustainable energy solutions</p>
                </div>
                
                <div className="bg-white rounded p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">HealthBridge</span>
                    <span className="text-green-600 font-semibold">$3,200 raised</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Digital health platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Investors */}
      <section id="for-investors" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-semibold mb-6">Investment Dashboard</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">TechFlow Solutions</p>
                    <p className="text-sm text-gray-600">Investment: $500</p>
                  </div>
                  <span className="text-green-600 font-semibold">+15%</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">GreenEnergy Co</p>
                    <p className="text-sm text-gray-600">Investment: $1,000</p>
                  </div>
                  <span className="text-green-600 font-semibold">+8%</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">HealthBridge</p>
                    <p className="text-sm text-gray-600">Investment: $750</p>
                  </div>
                  <span className="text-green-600 font-semibold">+22%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Perfect for Investors</h2>
              <p className="text-xl text-gray-600 mb-8">
                Discover and invest in promising early-stage startups with confidence and transparency.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-fundry-navy rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Curated Opportunities</h3>
                    <p className="text-gray-600">Access vetted startups and early-stage investment opportunities.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-fundry-navy rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Low Minimum Investments</h3>
                    <p className="text-gray-600">Start investing with as little as $25 in promising startups.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-fundry-navy rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Portfolio Tracking</h3>
                    <p className="text-gray-600">Monitor your investments and receive updates from founders.</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="mt-8 bg-fundry-navy hover:bg-blue-800" 
                size="lg"
                onClick={handleInvestorInfo}
              >
                Learn About Investing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-fundry-navy text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Fundraising Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of founders who have successfully raised capital through Fundry's platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-fundry-orange hover:bg-orange-600 text-lg px-8 py-4"
              onClick={handleGetStarted}
            >
              Start Fundraising Today
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-fundry-navy text-lg px-8 py-4"
              onClick={() => setShowLearnMoreModal(true)}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <OnboardingModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        defaultUserType={defaultUserType}
      />
      
      <LearnMoreModal 
        isOpen={showLearnMoreModal}
        onClose={() => setShowLearnMoreModal(false)}
        onGetStarted={handleGetStarted}
      />
      
      <InvestorInfoModal 
        isOpen={showInvestorModal}
        onClose={() => setShowInvestorModal(false)}
        onGetStarted={handleGetStarted}
      />
    </div>
  );
}