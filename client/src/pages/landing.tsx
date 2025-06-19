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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <FundryLogo className="h-10 w-auto" />
              <div className="hidden md:flex space-x-6">
                <a href="#how-it-works" className="text-gray-700 hover:text-fundry-orange transition-colors">How it Works</a>
                <button 
                  onClick={() => setShowLearnMoreModal(true)}
                  className="text-gray-700 hover:text-fundry-orange transition-colors"
                >
                  For Founders
                </button>
                <button 
                  onClick={() => setShowInvestorModal(true)}
                  className="text-gray-700 hover:text-fundry-orange transition-colors"
                >
                  For Investors
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin-login">
                <Button variant="outline" className="border-fundry-navy text-fundry-navy hover:bg-fundry-navy hover:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Centre
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleSignIn} className="text-fundry-navy hover:text-fundry-orange">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-fundry-orange hover:bg-orange-600">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-fundry-gradient text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-fundry-navy/90 to-blue-900/90"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Raise Your First{" "}
                  <span className="text-fundry-orange">$5,000</span>{" "}
                  From Friends & Family
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
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

            <div className="relative">
              <Card className="transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Campaign Dashboard</h3>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-fundry-orange">$3,250</div>
                        <div className="text-sm text-gray-600">Raised of $5,000</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-fundry-navy">23</div>
                        <div className="text-sm text-gray-600">Investors</div>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-fundry-orange h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-to-br from-fundry-orange-light to-orange-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center mb-6">
                  <Rocket className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Campaign Setup</h3>
                <p className="text-gray-600">Create professional fundraising campaigns in minutes with our intuitive builder.</p>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-fundry-navy rounded-lg flex items-center justify-center mb-6">
                  <Shield className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Automated SAFE Agreements</h3>
                <p className="text-gray-600">Generate legally compliant SAFE agreements automatically with digital signatures.</p>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-6">
                  <Users className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Private Network Access</h3>
                <p className="text-gray-600">Share exclusive investment opportunities with your personal network only.</p>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-6">
                  <BarChart className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Analytics</h3>
                <p className="text-gray-600">Track campaign performance and investor engagement with detailed insights.</p>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-6">
                  <Smartphone className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Mobile Optimized</h3>
                <p className="text-gray-600">Manage campaigns and investments seamlessly across all devices.</p>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-rose-50 to-pink-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-rose-500 rounded-lg flex items-center justify-center mb-6">
                  <Headphones className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">24/7 Support</h3>
                <p className="text-gray-600">Get expert help whenever you need it throughout your fundraising journey.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Fundry Works</h2>
            <p className="text-xl text-gray-600">Simple steps to start raising capital from your network</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Your Campaign</h3>
              <p className="text-gray-600">Set up your fundraising campaign with pitch deck, funding goal, and business details.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-fundry-navy rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Private Link</h3>
              <p className="text-gray-600">Share your campaign with friends, family, and trusted contacts via private links.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Collect Investments</h3>
              <p className="text-gray-600">Investors commit funds and sign SAFE agreements. Funds are held securely until campaign closes.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <OnboardingModal 
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setDefaultUserType(undefined);
        }}
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
        onGetStarted={() => {
          setShowInvestorModal(false);
          setAuthMode("signup");
          setShowAuthModal(true);
        }}
      />
    </div>
  );
}
