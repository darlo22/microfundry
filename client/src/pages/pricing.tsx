import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  DollarSign, 
  Zap, 
  Shield, 
  Users,
  Calculator,
  HelpCircle,
  ArrowRight
} from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free Tier",
      description: "Perfect for small campaigns and testing the platform",
      price: "Free",
      condition: "For campaigns under $1,000",
      color: "border-green-500",
      buttonText: "Start Free Campaign",
      buttonStyle: "bg-green-500 hover:bg-green-600",
      features: [
        { name: "Campaign creation", included: true },
        { name: "Private campaign links", included: true },
        { name: "SAFE agreement generation", included: true },
        { name: "Basic investor management", included: true },
        { name: "Email support", included: true },
        { name: "Platform fees", included: false, note: "0% fees" },
        { name: "Payment processing", included: true, note: "Standard rates apply" },
        { name: "Priority support", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Custom branding", included: false }
      ]
    },
    {
      name: "Standard",
      description: "For serious fundraising campaigns",
      price: "5%",
      condition: "Platform fee on amounts above $1,000",
      color: "border-fundry-orange",
      buttonText: "Start Campaign",
      buttonStyle: "bg-fundry-orange hover:bg-orange-600",
      featured: true,
      features: [
        { name: "Everything in Free Tier", included: true },
        { name: "Unlimited campaign size", included: true },
        { name: "Advanced investor analytics", included: true },
        { name: "Priority email support", included: true },
        { name: "Campaign optimization tips", included: true },
        { name: "Platform fees", included: true, note: "5% on amounts >$1K" },
        { name: "Payment processing", included: true, note: "Standard rates apply" },
        { name: "Custom campaign branding", included: true },
        { name: "Investor CRM tools", included: true },
        { name: "Phone support", included: false }
      ]
    }
  ];

  const faqItems = [
    {
      question: "How are platform fees calculated?",
      answer: "We charge 5% only on the amount raised above $1,000. For example, if you raise $5,000, the fee is 5% × $4,000 = $200. Campaigns raising under $1,000 pay no platform fees."
    },
    {
      question: "When are fees charged?",
      answer: "Platform fees are automatically deducted from the total amount raised when funds are transferred to your account after a successful campaign close."
    },
    {
      question: "Are there any payment processing fees?",
      answer: "Yes, standard payment processing fees apply (typically 2.9% + 30¢ per transaction) and are charged separately from our platform fees."
    },
    {
      question: "Can I change plans during my campaign?",
      answer: "Your pricing tier is automatically determined by the amount you raise. If you start in the Free Tier and exceed $1,000, you'll automatically move to the Standard plan."
    },
    {
      question: "Are there any setup or monthly fees?",
      answer: "No, there are no setup fees, monthly fees, or hidden costs. You only pay our platform fee when you successfully raise money."
    },
    {
      question: "What happens if my campaign doesn't reach its goal?",
      answer: "If your campaign doesn't close successfully, no platform fees are charged. You're only responsible for any payment processing fees from actual transactions."
    }
  ];

  const comparisonFeatures = [
    "Campaign Creation",
    "Private Links", 
    "SAFE Agreements",
    "Investor Management",
    "Email Support",
    "Analytics Dashboard",
    "Priority Support",
    "Custom Branding",
    "API Access",
    "Dedicated Manager"
  ];

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
            Start for free and only pay when you succeed. Our pricing scales with your campaign size, 
            ensuring fairness for founders at every stage.
          </p>
          
          {/* Key Value Proposition */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <DollarSign className="text-green-600 mr-2" size={24} />
              <span className="text-lg font-semibold text-green-800">
                100% Free for campaigns under $1,000
              </span>
            </div>
            <p className="text-green-700">
              Test our platform, raise small amounts, or bootstrap your startup without any fees.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.color} ${plan.featured ? 'ring-2 ring-fundry-orange' : ''}`}>
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-fundry-orange text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.price}
                  </div>
                  <p className="text-sm text-gray-600">{plan.condition}</p>
                </div>
                
                <Button className={`w-full ${plan.buttonStyle}`}>
                  {plan.buttonText}
                </Button>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      {feature.included ? (
                        <Check className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                      ) : (
                        <X className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                      )}
                      <div className="flex-1">
                        <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.name}
                        </span>
                        {feature.note && (
                          <div className="text-xs text-gray-500 mt-1">
                            {feature.note}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fee Calculator */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center text-center justify-center">
              <Calculator className="mr-3 text-fundry-orange" size={24} />
              Fee Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <p className="text-center text-gray-600 mb-6">
                See exactly how much you'll pay based on your fundraising goal
              </p>
              
              <div className="grid md:grid-cols-4 gap-6 text-center">
                {[
                  { raised: 500, fee: 0, net: 500 },
                  { raised: 2000, fee: 50, net: 1950 },
                  { raised: 10000, fee: 450, net: 9550 },
                  { raised: 50000, fee: 2450, net: 47550 }
                ].map((example, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      ${example.raised.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Platform fee:</div>
                    <div className="text-fundry-orange font-semibold mb-2">
                      ${example.fee}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">You receive:</div>
                    <div className="text-green-600 font-bold">
                      ${example.net.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm text-center">
                  <strong>Formula:</strong> Platform fee = 5% × (Amount raised - $1,000)
                  <br />
                  Plus standard payment processing fees (2.9% + 30¢ per transaction)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center">Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Free Tier</th>
                    <th className="text-center py-3 px-4 bg-orange-50">Standard</th>
                    <th className="text-center py-3 px-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 font-medium">{feature}</td>
                      <td className="text-center py-3 px-4">
                        {index < 5 ? (
                          <Check className="text-green-500 mx-auto" size={16} />
                        ) : (
                          <X className="text-gray-400 mx-auto" size={16} />
                        )}
                      </td>
                      <td className="text-center py-3 px-4 bg-orange-50">
                        {index < 9 ? (
                          <Check className="text-green-500 mx-auto" size={16} />
                        ) : (
                          <X className="text-gray-400 mx-auto" size={16} />
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Check className="text-green-500 mx-auto" size={16} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Value Propositions */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No Upfront Costs
              </h3>
              <p className="text-gray-600">
                Start your campaign immediately with zero setup fees. 
                Only pay when you successfully raise money.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Fair & Transparent
              </h3>
              <p className="text-gray-600">
                Our 5% fee only applies to amounts above $1,000. 
                No hidden fees, no monthly charges, no surprises.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Success-Based Pricing
              </h3>
              <p className="text-gray-600">
                We only succeed when you do. Our interests are aligned 
                with your campaign's success from day one.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <HelpCircle className="mr-3 text-fundry-orange" size={24} />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqItems.map((faq, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enterprise CTA */}
        <Card className="mb-16 bg-fundry-navy text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Large campaigns, institutional investors, or custom requirements? 
              Our Enterprise plan offers tailored solutions with dedicated support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-fundry-orange hover:bg-orange-600">
                Contact Sales Team
                <ArrowRight className="ml-2" size={16} />
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-fundry-navy">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              Talk to our team about volume discounts and custom integrations
            </p>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <Card className="bg-gradient-to-r from-fundry-orange to-orange-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Fundraising?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of founders who have successfully raised capital through their networks.
            </p>
            <Button className="bg-white text-fundry-orange hover:bg-gray-100 text-lg px-8 py-3">
              Create Your Campaign
            </Button>
            <p className="text-sm opacity-75 mt-4">
              Start for free • No setup fees • Only pay when you succeed
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}