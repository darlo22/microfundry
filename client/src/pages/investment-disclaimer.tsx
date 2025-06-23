import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, DollarSign, Shield } from "lucide-react";

export default function InvestmentDisclaimer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Investment Disclaimer" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">⚠️ Investment Disclaimer</h1>
          <p className="text-lg text-gray-600">
            Effective Date: June 17, 2025
          </p>
          <p className="text-gray-600 mt-2">
            Important risk disclosure and investment warnings for Fundry platform users.
          </p>
        </div>

        {/* Critical Warning */}
        <Card className="mb-8 border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="mr-3 text-red-600" size={24} />
              CRITICAL INVESTMENT WARNINGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-red-800">
              <div className="flex items-start space-x-3">
                <TrendingDown className="text-red-600 mt-1" size={20} />
                <div>
                  <p className="font-bold">HIGH RISK OF TOTAL LOSS</p>
                  <p className="text-sm">You may lose 100% of your investment. Early-stage companies fail frequently.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <DollarSign className="text-red-600 mt-1" size={20} />
                <div>
                  <p className="font-bold">ILLIQUID INVESTMENTS</p>
                  <p className="text-sm">Your money will be locked up for years with no guaranteed exit strategy.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="text-red-600 mt-1" size={20} />
                <div>
                  <p className="font-bold">NO INVESTOR PROTECTIONS</p>
                  <p className="text-sm">These investments are not protected by FDIC insurance or SEC oversight.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣ Investment Risks</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Total Loss of Capital</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li>• You may lose your entire investment</li>
                <li>• Early-stage companies have extremely high failure rates (90%+)</li>
                <li>• No guarantees of returns, profits, or capital preservation</li>
                <li>• Market conditions can drastically affect startup success</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Illiquidity</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li>• Investments are typically illiquid for 5-10 years or longer</li>
                <li>• No secondary market for selling your investment</li>
                <li>• Capital may be permanently tied up</li>
                <li>• Emergency liquidity needs cannot be met through these investments</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dilution Risk</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Future funding rounds may significantly dilute your ownership</li>
                <li>• Anti-dilution protections may not apply to small investors</li>
                <li>• Your percentage ownership can decrease dramatically</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2️⃣ SAFE Agreement Risks</h2>
              
              <ul className="space-y-3 text-gray-700">
                <li>• <strong>No Immediate Ownership:</strong> SAFE agreements do not provide immediate equity or voting rights</li>
                <li>• <strong>Conversion Uncertainty:</strong> Conversion to equity depends on future triggering events that may never occur</li>
                <li>• <strong>Subordination:</strong> SAFE holders typically rank below debt holders in liquidation scenarios</li>
                <li>• <strong>Valuation Risk:</strong> Conversion terms may result in minimal equity if company valuation increases significantly</li>
                <li>• <strong>No Maturity Date:</strong> Unlike debt, SAFEs may never convert or pay out</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3️⃣ Platform Limitations</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fundry's Role</h3>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li>• Fundry is a technology platform, not an investment adviser</li>
                <li>• We do not provide investment advice or recommendations</li>
                <li>• We do not verify or validate company information</li>
                <li>• We are not responsible for investment outcomes</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Due Diligence</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• All due diligence is your responsibility</li>
                <li>• Company information may be incomplete, outdated, or inaccurate</li>
                <li>• Past performance does not predict future results</li>
                <li>• Forward-looking statements are speculative</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4️⃣ Regulatory Considerations</h2>
              
              <ul className="space-y-3 text-gray-700">
                <li>• <strong>No SEC Registration:</strong> These securities are not registered with the Securities and Exchange Commission</li>
                <li>• <strong>Limited Oversight:</strong> Private offerings have minimal regulatory oversight</li>
                <li>• <strong>Investor Limitations:</strong> Certain investments may have investor qualification requirements</li>
                <li>• <strong>Tax Implications:</strong> Complex tax consequences may apply - consult a tax professional</li>
                <li>• <strong>Regulatory Changes:</strong> Future regulatory changes may affect your investment</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5️⃣ Suitability Requirements</h2>
              
              <p className="text-gray-700 mb-4 font-semibold">
                These investments are only suitable for investors who:
              </p>
              
              <ul className="space-y-2 text-gray-700">
                <li>• Can afford to lose their entire investment</li>
                <li>• Have adequate liquid savings for emergencies</li>
                <li>• Understand the high-risk nature of startup investments</li>
                <li>• Can wait 5-10+ years for potential returns</li>
                <li>• Have investment experience or professional guidance</li>
                <li>• Meet any applicable income or net worth requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6️⃣ No Investment Advice</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-800 font-semibold mb-3">
                  IMPORTANT: Fundry does not provide investment advice.
                </p>
                <ul className="space-y-2 text-yellow-800 text-sm">
                  <li>• We are not licensed investment advisers</li>
                  <li>• All investment decisions are entirely your responsibility</li>
                  <li>• Consult qualified financial professionals before investing</li>
                  <li>• Consider your personal financial situation and risk tolerance</li>
                  <li>• Seek independent legal and tax advice as needed</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7️⃣ Forward-Looking Statements</h2>
              
              <p className="text-gray-700 mb-4">
                Company presentations and materials may contain forward-looking statements that:
              </p>
              
              <ul className="space-y-2 text-gray-700">
                <li>• Are based on current expectations and assumptions</li>
                <li>• May not reflect actual future performance</li>
                <li>• Are subject to significant risks and uncertainties</li>
                <li>• Should not be relied upon as guarantees of future results</li>
                <li>• May be materially different from actual outcomes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-red-800 mb-4">⚠️ Final Warning</h2>
              
              <div className="space-y-4 text-red-700">
                <p className="font-semibold text-lg">
                  ONLY INVEST MONEY YOU CAN AFFORD TO LOSE COMPLETELY
                </p>
                
                <ul className="space-y-2">
                  <li>• These are extremely high-risk investments</li>
                  <li>• The majority of startups fail within the first few years</li>
                  <li>• Your capital may be permanently lost</li>
                  <li>• No returns are guaranteed or expected</li>
                  <li>• Illiquidity may prevent access to your money for years</li>
                </ul>
                
                <p className="font-semibold mt-6">
                  By proceeding with any investment, you acknowledge that you have read, understood, 
                  and accepted all risks outlined in this disclaimer.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              
              <p className="text-gray-700 mb-4">
                For questions about investment risks or this disclaimer:
              </p>

              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@fundry.com</p>
                <p><strong>Address:</strong> 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) FUNDRY-1</p>
              </div>

              <p className="text-gray-700 mt-4">
                For urgent risk-related inquiries, please mark your communication as "Investment Risk Question" 
                for expedited handling.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}