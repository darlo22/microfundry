import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, DollarSign, Clock, Scale } from "lucide-react";

export default function InvestmentDisclaimer() {
  const riskFactors = [
    {
      title: "Total Loss of Investment",
      description: "Early-stage companies have a high failure rate. You may lose your entire investment.",
      icon: TrendingDown,
      severity: "high"
    },
    {
      title: "Illiquidity",
      description: "SAFE investments cannot be easily sold or transferred. Your money may be locked up for years.",
      icon: Clock,
      severity: "high"
    },
    {
      title: "Dilution",
      description: "Future funding rounds may significantly reduce your ownership percentage.",
      icon: DollarSign,
      severity: "medium"
    },
    {
      title: "No Voting Rights",
      description: "SAFE agreements typically do not provide voting rights or board representation.",
      icon: Scale,
      severity: "medium"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Investment Disclaimer" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Investment Disclaimer</h1>
          <p className="text-lg text-gray-600">
            Important Risk Disclosures for Fundry Platform Users
          </p>
        </div>

        {/* Critical Warning */}
        <Card className="mb-8 border-red-300 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="text-red-600 mt-1" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-red-900 mb-4">CRITICAL INVESTMENT WARNING</h2>
                <div className="space-y-3 text-red-800">
                  <p className="font-semibold">
                    INVESTING IN EARLY-STAGE COMPANIES INVOLVES SUBSTANTIAL RISK AND IS SUITABLE ONLY FOR SOPHISTICATED INVESTORS WHO CAN AFFORD TO LOSE THEIR ENTIRE INVESTMENT.
                  </p>
                  <p>
                    Before investing, carefully consider whether you can afford to lose the money you are investing. These investments are highly speculative and illiquid.
                  </p>
                  <p>
                    Do not invest money that you need for living expenses, emergencies, or other financial obligations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Risk Factors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">Key Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {riskFactors.map((risk, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  risk.severity === 'high' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    <risk.icon className={`mt-1 ${
                      risk.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                    }`} size={24} />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{risk.title}</h3>
                      <p className="text-gray-700 text-sm">{risk.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* General Risks */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">General Investment Risks</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Failure Risk</h3>
                <p className="text-gray-700 mb-2">
                  Most early-stage companies fail. According to industry data, approximately 90% of startups fail, 
                  with many failing within the first 2-3 years of operation.
                </p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Market rejection of products or services</li>
                  <li>• Inability to achieve product-market fit</li>
                  <li>• Running out of capital before becoming profitable</li>
                  <li>• Competition from larger, established companies</li>
                  <li>• Management team inexperience or turnover</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Market and Economic Risks</h3>
                <p className="text-gray-700 mb-2">
                  External factors beyond the company's control can significantly impact investment outcomes:
                </p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Economic downturns and recessions</li>
                  <li>• Changes in market conditions and demand</li>
                  <li>• Regulatory changes affecting the industry</li>
                  <li>• Technology disruption and obsolescence</li>
                  <li>• Supply chain disruptions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Valuation and Pricing Risks</h3>
                <p className="text-gray-700 mb-2">
                  Early-stage company valuations are highly speculative and may not reflect actual value:
                </p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Lack of comparable market data</li>
                  <li>• Overvaluation due to market hype</li>
                  <li>• Future funding rounds at lower valuations (down rounds)</li>
                  <li>• No guarantee of achieving projected growth rates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SAFE-Specific Risks */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">SAFE Agreement Specific Risks</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversion Uncertainty</h3>
                <p className="text-gray-700">
                  SAFE agreements only convert to equity upon specific triggering events. If these events 
                  never occur, you may never receive equity in the company.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Maturity Date</h3>
                <p className="text-gray-700">
                  Unlike traditional debt instruments, SAFEs typically have no maturity date, meaning 
                  there is no guaranteed timeline for receiving returns.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Subordination to Other Investors</h3>
                <p className="text-gray-700">
                  In liquidation scenarios, SAFE holders are typically subordinate to debt holders and 
                  may receive nothing if the company's assets are insufficient.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Limited Information Rights</h3>
                <p className="text-gray-700">
                  SAFE agreements may not provide the same information rights as traditional equity investments, 
                  limiting your ability to monitor your investment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Limitations */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Limitations</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Investment Advice</h3>
                <p className="text-gray-700">
                  Fundry does not provide investment advice, recommendations, or due diligence services. 
                  All investment decisions are solely your responsibility.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Limited Due Diligence</h3>
                <p className="text-gray-700">
                  While we require certain information from founders, we do not verify the accuracy of 
                  campaign information or conduct independent due diligence on investment opportunities.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Secondary Market</h3>
                <p className="text-gray-700">
                  There is no secondary market for SAFE agreements facilitated through our platform. 
                  Your investment will be illiquid until a qualifying conversion event occurs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investor Qualifications */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Investor Qualifications</h2>
            
            <p className="text-gray-700 mb-4">
              Before investing, ensure you meet the following criteria:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Capability</h3>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>• Can afford to lose entire investment amount</li>
                  <li>• Investment represents less than 10% of net worth</li>
                  <li>• Have adequate emergency savings</li>
                  <li>• No immediate need for invested funds</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Knowledge and Experience</h3>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>• Understand startup investment risks</li>
                  <li>• Familiar with SAFE agreement terms</li>
                  <li>• Experience with illiquid investments</li>
                  <li>• Ability to evaluate business opportunities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal and Regulatory */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal and Regulatory Considerations</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Securities Laws</h3>
                <p className="text-gray-700">
                  SAFE investments are securities subject to federal and state securities laws. 
                  Ensure your investment complies with applicable regulations in your jurisdiction.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Implications</h3>
                <p className="text-gray-700">
                  SAFE investments may have complex tax implications. Consult with a qualified 
                  tax advisor to understand the potential tax consequences of your investment.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No FDIC Insurance</h3>
                <p className="text-gray-700">
                  SAFE investments are not bank deposits and are not insured by the FDIC or any 
                  other government agency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Warning */}
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Final Important Reminders</h2>
            
            <div className="space-y-3 text-red-800">
              <p className="font-semibold">
                • Only invest money you can afford to lose completely
              </p>
              <p className="font-semibold">
                • Diversify your investments across multiple opportunities and asset classes
              </p>
              <p className="font-semibold">
                • Conduct your own due diligence before making any investment decision
              </p>
              <p className="font-semibold">
                • Consult with qualified financial, legal, and tax advisors
              </p>
              <p className="font-semibold">
                • Understand that past performance does not guarantee future results
              </p>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg">
              <p className="text-gray-900 text-sm">
                <strong>Disclaimer:</strong> This information is provided for educational purposes only 
                and does not constitute investment advice. Fundry makes no representations or warranties 
                about the accuracy or completeness of this information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}