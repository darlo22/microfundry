import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Shield, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface InvestorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
}

export default function InvestorInfoModal({ isOpen, onClose, onGetStarted }: InvestorInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-fundry-navy text-center">
            Invest in Early-Stage Startups
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join the next generation of micro-investments. Support innovative startups 
              with as little as $25 and help shape the future of entrepreneurship.
            </p>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-fundry-orange">$25</div>
                <div className="text-sm text-gray-600">Min Investment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fundry-orange">5%</div>
                <div className="text-sm text-gray-600">Platform Fee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-fundry-orange">SAFE</div>
                <div className="text-sm text-gray-600">Agreements</div>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-fundry-navy rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">High Growth Potential</h3>
                    <p className="text-sm text-gray-600">
                      Invest in pre-seed startups with significant upside potential. 
                      Early-stage investments offer the highest returns when companies succeed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Shield className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Legal Protection</h3>
                    <p className="text-sm text-gray-600">
                      All investments are backed by SAFE agreements, providing standardized 
                      legal framework and investor rights protection.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center">
                    <DollarSign className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Low Minimum Investment</h3>
                    <p className="text-sm text-gray-600">
                      Start investing with just $25. Build a diversified portfolio 
                      of early-stage companies without large capital requirements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Users className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Exclusive Access</h3>
                    <p className="text-sm text-gray-600">
                      Access private investment opportunities shared directly 
                      by founders in your network and trusted connections.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Process */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 text-center">How It Works</h3>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-fundry-orange rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-medium text-gray-900">Browse</h4>
                <p className="text-sm text-gray-600">Discover vetted startup opportunities</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-fundry-navy rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-medium text-gray-900">Review</h4>
                <p className="text-sm text-gray-600">Analyze pitch decks and business plans</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-medium text-gray-900">Invest</h4>
                <p className="text-sm text-gray-600">Commit funds and sign SAFE agreement</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-medium text-gray-900">Track</h4>
                <p className="text-sm text-gray-600">Monitor progress and returns</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Why Choose Fundry?</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">SEC-compliant SAFE agreements</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Transparent fee structure</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Real-time portfolio tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Direct founder communication</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">Investment cap protection</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-green-500" size={20} />
                <span className="text-gray-700">24/7 customer support</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-fundry-orange hover:bg-orange-600 text-lg px-8 py-4"
            >
              Start Investing Today
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <p className="text-sm text-gray-500">
              Join thousands of investors supporting the next generation of startups
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}