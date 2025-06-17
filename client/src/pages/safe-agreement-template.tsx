import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, AlertCircle, Scale } from "lucide-react";

export default function SafeAgreementTemplate() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="SAFE Agreement Template" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📄 SAFE Agreement Template</h1>
          <p className="text-lg text-gray-600">
            Simple Agreement for Future Equity (SAFE)
          </p>
          <p className="text-gray-600 mt-2">
            Standard template used for investments on the Fundry platform.
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertCircle className="mr-3 text-yellow-600" size={24} />
              Legal Document Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-yellow-800">
              <p className="font-semibold">This is a legally binding investment contract.</p>
              <ul className="space-y-1 text-sm">
                <li>• Seek independent legal advice before signing</li>
                <li>• Understand all terms and conditions</li>
                <li>• Consider the risks outlined in our Investment Disclaimer</li>
                <li>• Ensure you meet suitability requirements</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 About SAFE Agreements</h2>
              
              <p className="text-gray-700 mb-4">
                A Simple Agreement for Future Equity (SAFE) is an investment contract that provides 
                the right to receive equity in a company at a future date, typically upon a qualifying 
                financing round or liquidity event.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Key Features</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• No immediate equity ownership</li>
                    <li>• Converts to shares upon triggering events</li>
                    <li>• Includes discount rate and valuation cap</li>
                    <li>• No interest or maturity date</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Conversion Events</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Equity financing round</li>
                    <li>• Liquidity event (sale, IPO)</li>
                    <li>• Dissolution event</li>
                    <li>• Optional conversion by company</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📑 Standard SAFE Template</h2>
                <Button className="bg-fundry-orange hover:bg-orange-600">
                  <Download className="mr-2" size={16} />
                  Download PDF
                </Button>
              </div>
              
              <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-gray-900">SIMPLE AGREEMENT FOR FUTURE EQUITY</h3>
                  <p className="text-gray-600 mt-2">(SAFE - Valuation Cap, No Discount)</p>
                </div>

                <div className="space-y-6 text-sm text-gray-700">
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">THIS CERTIFIES THAT</h4>
                    <p>
                      in exchange for the payment by [INVESTOR NAME] (the "Investor") of $[INVESTMENT AMOUNT] 
                      (the "Purchase Amount") on or about [DATE], [COMPANY NAME], a Delaware corporation 
                      (the "Company"), issues to the Investor the right to certain shares of the Company's 
                      Capital Stock, subject to the terms described below.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">1. DEFINITIONS</h4>
                    <div className="space-y-2 pl-4">
                      <p><strong>"Valuation Cap"</strong> means $[VALUATION CAP AMOUNT].</p>
                      <p><strong>"Discount Rate"</strong> means [DISCOUNT PERCENTAGE]%.</p>
                      <p><strong>"Company Capitalization"</strong> means all shares of Capital Stock outstanding immediately prior to the Equity Financing.</p>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">2. EQUITY FINANCING</h4>
                    <p>
                      If there is an Equity Financing before the expiration or termination of this instrument, 
                      the Company will automatically issue to the Investor a number of shares of SAFE Preferred Stock 
                      equal to the Purchase Amount divided by the SAFE Price.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">3. LIQUIDITY EVENT</h4>
                    <p>
                      If there is a Liquidity Event before the expiration or termination of this instrument, 
                      the Investor will, at the Investor's option, either receive a cash payment or convert 
                      the SAFE into shares of Common Stock.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">4. DISSOLUTION EVENT</h4>
                    <p>
                      If there is a Dissolution Event before this instrument expires or terminates, 
                      the Company will pay an amount equal to the Purchase Amount, prior and in preference 
                      to any payment of any Dissolution Event proceeds to holders of Capital Stock.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">5. TRANSFER RESTRICTIONS</h4>
                    <p>
                      This SAFE and any securities issuable pursuant hereto may not be transferred without 
                      the Company's written consent, which may be withheld in the Company's sole discretion.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">6. GOVERNING LAW</h4>
                    <p>
                      This instrument shall be governed by and construed under the laws of the State of Delaware, 
                      excluding the conflict of laws rules of such State.
                    </p>
                  </section>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">COMPANY:</p>
                      <p className="text-sm text-gray-600">[COMPANY NAME]</p>
                      <div className="mt-4">
                        <div className="border-b border-gray-300 w-48 mb-1"></div>
                        <p className="text-xs text-gray-500">Signature</p>
                      </div>
                      <div className="mt-3">
                        <div className="border-b border-gray-300 w-48 mb-1"></div>
                        <p className="text-xs text-gray-500">Print Name</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">INVESTOR:</p>
                      <p className="text-sm text-gray-600">[INVESTOR NAME]</p>
                      <div className="mt-4">
                        <div className="border-b border-gray-300 w-48 mb-1"></div>
                        <p className="text-xs text-gray-500">Signature</p>
                      </div>
                      <div className="mt-3">
                        <div className="border-b border-gray-300 w-48 mb-1"></div>
                        <p className="text-xs text-gray-500">Print Name</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🔧 How Fundry Uses SAFEs</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Automated Generation</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• SAFEs are automatically generated when you invest</li>
                    <li>• Terms are pre-populated based on campaign settings</li>
                    <li>• Digital signatures facilitate quick execution</li>
                    <li>• Documents are stored securely on the platform</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Standard Terms</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Valuation cap set by founder</li>
                    <li>• Standard discount rate (typically 10-20%)</li>
                    <li>• No interest accrual</li>
                    <li>• Delaware law governance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">⚖️ Important Legal Considerations</h2>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">High Risk Investment</h4>
                  <p className="text-red-700 text-sm">
                    SAFEs represent extremely high-risk investments. You may lose your entire investment. 
                    Conversion to equity is not guaranteed and depends on future events that may never occur.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">No Immediate Rights</h4>
                  <p className="text-yellow-700 text-sm">
                    SAFEs do not provide immediate ownership rights, voting rights, or dividend rights. 
                    You are not a shareholder until conversion occurs.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Legal Advice Required</h4>
                  <p className="text-blue-700 text-sm">
                    Always consult with qualified legal and financial advisors before signing any SAFE agreement. 
                    Understand all terms, conditions, and potential outcomes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Additional Resources</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Scale className="text-fundry-orange mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">Y Combinator SAFE Resources</h4>
                    <p className="text-gray-700 text-sm">
                      The original SAFE documentation and educational materials from Y Combinator
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FileText className="text-fundry-orange mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">SEC Investor Bulletin</h4>
                    <p className="text-gray-700 text-sm">
                      Securities and Exchange Commission guidance on SAFE agreements and startup investing
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <AlertCircle className="text-fundry-orange mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900">Legal Primer</h4>
                    <p className="text-gray-700 text-sm">
                      Understanding the legal implications and risks of SAFE investments
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              
              <p className="text-gray-700 mb-4">
                For questions about SAFE agreements or legal documentation:
              </p>

              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@fundry.com</p>
                <p><strong>Address:</strong> 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) FUNDRY-1</p>
              </div>

              <p className="text-gray-700 mt-4">
                For SAFE-related legal questions, please mark your communication as "SAFE Agreement Question" 
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