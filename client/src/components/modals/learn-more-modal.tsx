import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Rocket, 
  Shield, 
  Users, 
  BarChart, 
  DollarSign, 
  Clock,
  CheckCircle,
  ArrowRight,
  FileText,
  Zap
} from "lucide-react";
import { Link } from "wouter";

interface LearnMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export default function LearnMoreModal({ isOpen, onClose, onGetStarted }: LearnMoreModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-fundry-navy text-center">
            Everything You Need to Know About Fundry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Overview */}
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Fundry is the simplest way for early-stage startups to raise their first $5,000 
              from friends, family, and personal networks through automated SAFE agreements.
            </p>
            
            <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-fundry-orange">$5K</div>
                <div className="text-sm text-gray-600">Max Campaign</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fundry-orange">$25</div>
                <div className="text-sm text-gray-600">Min Investment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fundry-orange">5%</div>
                <div className="text-sm text-gray-600">Fee ($1K+)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fundry-orange">Free</div>
                <div className="text-sm text-gray-600">Under $1K</div>
              </div>
            </div>
          </div>

          {/* For Founders */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 text-center">For Founders</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center">
                      <Rocket className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Launch in Minutes</h4>
                      <p className="text-sm text-gray-600">
                        Create professional campaigns with pitch deck upload, 
                        funding goals, and business profile in under 10 minutes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-fundry-navy rounded-lg flex items-center justify-center">
                      <Shield className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Legal Compliance</h4>
                      <p className="text-sm text-gray-600">
                        Automated SAFE agreement generation with digital signatures. 
                        SEC-compliant documentation handled automatically.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <Users className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Private Networks</h4>
                      <p className="text-sm text-gray-600">
                        Share campaigns via private links with your personal network. 
                        No public marketplace - keep it exclusive.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <BarChart className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h4>
                      <p className="text-sm text-gray-600">
                        Monitor campaign progress, investor commitments, 
                        and conversion rates with detailed analytics.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pricing Structure */}
          <div className="bg-gradient-to-r from-fundry-navy to-blue-900 rounded-lg p-8 text-white">
            <h3 className="text-xl font-semibold text-center mb-6">Transparent Pricing</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold">FREE</span>
                </div>
                <h4 className="text-lg font-semibold text-white">Under $1,000</h4>
                <p className="text-white/90">
                  No platform fees for campaigns raising less than $1,000. 
                  Perfect for testing and small rounds.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold">5%</span>
                </div>
                <h4 className="text-lg font-semibold text-white">Above $1,000</h4>
                <p className="text-white/90">
                  Simple 5% fee on successful campaigns above $1,000. 
                  Only pay when you successfully raise funds.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 text-center">How It Works</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-fundry-orange rounded-full flex items-center justify-center mx-auto">
                  <FileText className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900">1. Create Campaign</h4>
                <p className="text-sm text-gray-600">
                  Upload pitch deck, set funding goal ($25-$5,000), define SAFE terms 
                  (discount rate, valuation cap), and add business details.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-fundry-navy rounded-full flex items-center justify-center mx-auto">
                  <Users className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900">2. Share Privately</h4>
                <p className="text-sm text-gray-600">
                  Get unique private link to share with friends, family, mentors, 
                  and personal network. Control who has access.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900">3. Collect Investments</h4>
                <p className="text-sm text-gray-600">
                  Investors review, commit funds, and sign SAFE agreements digitally. 
                  Funds held securely until campaign closes.
                </p>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Why Fundry Works</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">No minimum viable product required</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Friends & family focus</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Automated legal documentation</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Private, invitation-only campaigns</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Real-time progress tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Mobile-optimized experience</span>
              </div>
            </div>
          </div>

          {/* Resource Links */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Learn More</h4>
                <div className="space-y-2">
                  <Link href="/how-it-works">
                    <Button variant="outline" size="sm" className="w-full">
                      How It Works
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="w-full">
                      Pricing Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Success Stories</h4>
                <div className="space-y-2">
                  <Link href="/success-stories">
                    <Button variant="outline" size="sm" className="w-full">
                      Case Studies
                    </Button>
                  </Link>
                  <Link href="/resources">
                    <Button variant="outline" size="sm" className="w-full">
                      Resources
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <CardContent className="p-0 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
                <div className="space-y-2">
                  <Link href="/contact">
                    <Button variant="outline" size="sm" className="w-full">
                      Contact Us
                    </Button>
                  </Link>
                  <Link href="/blog">
                    <Button variant="outline" size="sm" className="w-full">
                      Blog & Tips
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-fundry-orange hover:bg-orange-600 text-lg px-8 py-4"
            >
              Start Your Campaign
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <p className="text-sm text-gray-500">
              Join hundreds of founders who've successfully raised their first round
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}