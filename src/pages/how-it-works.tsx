import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Share2, 
  CreditCard, 
  Shield, 
  CheckCircle,
  Users,
  Rocket,
  TrendingUp,
  ArrowRight
} from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="How It Works" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How Fundry Works
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From campaign creation to fund collection, learn how Fundry simplifies 
            the fundraising process for both founders and investors.
          </p>
        </div>

        {/* For Founders Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge className="bg-fundry-orange text-white mb-4">For Founders</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Raise Capital from Your Network
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Turn your supporters into investors with our streamlined fundraising platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <Card className="relative">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-6 mt-4">
                  <FileText className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Your Campaign</h3>
                <p className="text-gray-600 mb-6">
                  Set up your fundraising campaign with business details, funding goals, 
                  pitch deck, and SAFE agreement terms.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Upload pitch deck and logo</li>
                  <li>• Set funding goal and minimum investment</li>
                  <li>• Configure SAFE terms (discount rate, valuation cap)</li>
                  <li>• Write compelling campaign description</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-fundry-navy rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-fundry-navy rounded-lg flex items-center justify-center mx-auto mb-6 mt-4">
                  <Share2 className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Private Link</h3>
                <p className="text-gray-600 mb-6">
                  Get a unique private link to share with your network. Control 
                  exactly who can view and invest in your campaign.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Share with friends, family, and network</li>
                  <li>• Track who views your campaign</li>
                  <li>• No public listing - complete privacy</li>
                  <li>• Custom branded campaign pages</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-6 mt-4">
                  <CheckCircle className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Collect Investments</h3>
                <p className="text-gray-600 mb-6">
                  Investors commit funds and sign SAFE agreements. Funds are held 
                  securely until your campaign closes successfully.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Automated SAFE agreement generation</li>
                  <li>• Secure payment processing</li>
                  <li>• Real-time progress tracking</li>
                  <li>• Investor management dashboard</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* For Investors Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge className="bg-fundry-navy text-white mb-4">For Investors</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Invest in Startups You Believe In
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Support entrepreneurs in your network with simple, standardized investments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <Card className="relative">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-6 mt-4">
                  <Users className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Discover Opportunities</h3>
                <p className="text-gray-600 mb-6">
                  Receive private campaign invitations from founders in your network 
                  or those you want to support.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Private invitation links</li>
                  <li>• Detailed campaign information</li>
                  <li>• Pitch deck access</li>
                  <li>• Transparent SAFE terms</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-6 mt-4">
                  <CreditCard className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Make Investment</h3>
                <p className="text-gray-600 mb-6">
                  Choose your investment amount and complete the secure payment 
                  process with standardized SAFE agreements.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Minimum investment amounts from $500</li>
                  <li>• Secure payment processing</li>
                  <li>• Digital SAFE agreement signing</li>
                  <li>• Instant investment confirmation</li>
                </ul>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative">
              <CardContent className="p-8 text-center">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-6 mt-4">
                  <TrendingUp className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Progress</h3>
                <p className="text-gray-600 mb-6">
                  Monitor your investments through your dashboard and receive 
                  updates from the companies you've invested in.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Investment portfolio dashboard</li>
                  <li>• Company progress updates</li>
                  <li>• Document management</li>
                  <li>• Performance tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SAFE Agreements Explanation */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Understanding SAFE Agreements
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Simple Agreement for Future Equity (SAFE) is a standardized investment 
                instrument that provides investors with rights to future equity.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="text-green-500 mt-1" size={16} />
                    <span className="text-gray-700">Simple and standardized legal structure</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="text-green-500 mt-1" size={16} />
                    <span className="text-gray-700">No board seats or voting rights initially</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="text-green-500 mt-1" size={16} />
                    <span className="text-gray-700">Converts to equity in future funding rounds</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="text-green-500 mt-1" size={16} />
                    <span className="text-gray-700">Investor-friendly discount rates</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Terms</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <ArrowRight className="text-fundry-orange mt-1" size={16} />
                    <span className="text-gray-700"><strong>Discount Rate:</strong> Percentage discount on future equity price</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <ArrowRight className="text-fundry-orange mt-1" size={16} />
                    <span className="text-gray-700"><strong>Valuation Cap:</strong> Maximum company value for conversion</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <ArrowRight className="text-fundry-orange mt-1" size={16} />
                    <span className="text-gray-700"><strong>Conversion Events:</strong> Triggers for equity conversion</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <ArrowRight className="text-fundry-orange mt-1" size={16} />
                    <span className="text-gray-700"><strong>Pro Rata Rights:</strong> Rights to invest in future rounds</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Security & Compliance
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank-Grade Security</h3>
                <p className="text-gray-600">
                  All data encrypted in transit and at rest. Secure payment processing 
                  with industry-leading providers.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Compliance</h3>
                <p className="text-gray-600">
                  Standardized SAFE agreements reviewed by legal experts. 
                  Compliance with securities regulations.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Investor Protection</h3>
                <p className="text-gray-600">
                  Clear terms, transparent processes, and dedicated support 
                  to protect all parties involved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-fundry-orange to-orange-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Whether you're raising capital or looking to invest, 
              Fundry makes the process simple and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-fundry-orange hover:bg-gray-100">
                <Rocket className="mr-2" size={16} />
                Start Fundraising
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-fundry-orange">
                Browse Campaigns
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}