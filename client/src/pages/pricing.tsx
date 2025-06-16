import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, DollarSign, TrendingUp, Shield, Users } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Pricing" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            We only succeed when you succeed. No upfront costs, no hidden fees, 
            just transparent pricing that scales with your fundraising success.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Free for campaigns under $1,000
          </Badge>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Tier */}
          <Card className="relative border-2 border-green-200">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-green-500 text-white px-4 py-1">
                Perfect for Testing
              </Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl text-gray-900 mb-2">Free Tier</CardTitle>
              <div className="text-4xl font-bold text-green-600 mb-2">$0</div>
              <p className="text-gray-600">For campaigns raising under $1,000</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Complete campaign setup</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Private link sharing</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>SAFE agreement generation</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Investor dashboard</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 mr-3" size={20} />
                  <span>Email support</span>
                </li>
              </ul>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                Start Free Campaign
              </Button>
            </CardContent>
          </Card>

          {/* Standard Tier */}
          <Card className="relative border-2 border-fundry-orange">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-fundry-orange text-white px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl text-gray-900 mb-2">Standard</CardTitle>
              <div className="text-4xl font-bold text-fundry-orange mb-2">5%</div>
              <p className="text-gray-600">Of successfully raised funds above $1,000</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="text-fundry-orange mr-3" size={20} />
                  <span>Everything in Free tier</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-fundry-orange mr-3" size={20} />
                  <span>Unlimited fundraising amount</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-fundry-orange mr-3" size={20} />
                  <span>Advanced analytics & reporting</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-fundry-orange mr-3" size={20} />
                  <span>Custom branding options</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-fundry-orange mr-3" size={20} />
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-fundry-orange mr-3" size={20} />
                  <span>Legal document templates</span>
                </li>
              </ul>
              <Button className="w-full bg-fundry-orange hover:bg-orange-600">
                Start Standard Campaign
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Examples */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-900">
              Pricing Examples
            </CardTitle>
            <p className="text-center text-gray-600">
              See exactly what you'll pay based on your fundraising success
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Amount Raised</th>
                    <th className="text-left py-3 px-4">Platform Fee</th>
                    <th className="text-left py-3 px-4">You Keep</th>
                    <th className="text-left py-3 px-4">Effective Rate</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">$500</td>
                    <td className="py-3 px-4 text-green-600 font-medium">$0</td>
                    <td className="py-3 px-4">$500</td>
                    <td className="py-3 px-4">0%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">$1,000</td>
                    <td className="py-3 px-4 text-green-600 font-medium">$0</td>
                    <td className="py-3 px-4">$1,000</td>
                    <td className="py-3 px-4">0%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">$5,000</td>
                    <td className="py-3 px-4 text-fundry-orange font-medium">$250</td>
                    <td className="py-3 px-4">$4,750</td>
                    <td className="py-3 px-4">5%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">$25,000</td>
                    <td className="py-3 px-4 text-fundry-orange font-medium">$1,250</td>
                    <td className="py-3 px-4">$23,750</td>
                    <td className="py-3 px-4">5%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">$100,000</td>
                    <td className="py-3 px-4 text-fundry-orange font-medium">$5,000</td>
                    <td className="py-3 px-4">$95,000</td>
                    <td className="py-3 px-4">5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* What's Included */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Bank-grade security, encrypted data, and secure payment processing 
                to protect both founders and investors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-fundry-navy rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Our team of fundraising experts is here to help you succeed, 
                from campaign setup to closing your round.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth Tools</h3>
              <p className="text-gray-600">
                Analytics, investor management, and growth insights to help 
                you build lasting relationships with your supporters.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-900">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  When do you charge the 5% fee?
                </h3>
                <p className="text-gray-600">
                  We only charge our 5% platform fee when your campaign successfully 
                  raises more than $1,000. The fee is deducted from the total amount 
                  raised before funds are transferred to you.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Are there any upfront costs?
                </h3>
                <p className="text-gray-600">
                  No upfront costs whatsoever. You can create and launch your campaign 
                  completely free. We only get paid when you successfully raise funds.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  What if my campaign doesn't reach its goal?
                </h3>
                <p className="text-gray-600">
                  If your campaign raises less than $1,000, there are no platform fees. 
                  If it raises more than $1,000 but doesn't reach your goal, you still 
                  pay the 5% fee on the amount successfully raised.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Are there any hidden fees?
                </h3>
                <p className="text-gray-600">
                  No hidden fees. The only costs are our transparent 5% platform fee 
                  on successful campaigns above $1,000. Payment processing fees may 
                  apply based on your chosen payment method.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Fundraising?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join hundreds of founders who have successfully raised capital 
              through their networks with Fundry's transparent, founder-friendly platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-fundry-orange hover:bg-orange-600">
                Start Free Campaign
              </Button>
              <Button variant="outline">
                Schedule Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}