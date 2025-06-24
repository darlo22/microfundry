import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, DollarSign, Briefcase, GraduationCap } from "lucide-react";

export default function InvestorAccreditation() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Investor Accreditation" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
            <UserCheck className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">👤 Investor Accreditation</h1>
          <p className="text-lg text-gray-600">
            Understanding Accredited Investor Requirements
          </p>
          <p className="text-gray-600 mt-2">
            Important information about investor qualifications and regulations.
          </p>
        </div>

        {/* Quick Reference */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-3 text-fundry-orange" size={24} />
              Accreditation Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Income Test</h3>
                <p className="text-sm text-gray-600">$200K+ individual or $300K+ joint income for 2+ years</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Net Worth Test</h3>
                <p className="text-sm text-gray-600">$1M+ net worth (excluding primary residence)</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Professional Test</h3>
                <p className="text-sm text-gray-600">Certain financial professionals and entities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 What is an Accredited Investor?</h2>
              
              <p className="text-gray-700 mb-4">
                An accredited investor is an individual or entity that meets certain financial criteria 
                established by the Securities and Exchange Commission (SEC). These requirements are designed 
                to ensure that investors have sufficient financial sophistication and resources to evaluate 
                and bear the risks of private securities offerings.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Important:</strong> Accredited investor status may be required for certain 
                  investment opportunities. Fundry's current model focuses on smaller investments 
                  that may be available to non-accredited investors, but regulations can vary.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Individual Accreditation Criteria</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Income Test</h3>
              <p className="text-gray-700 mb-2">You qualify if you have:</p>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li>• Individual income exceeding $200,000 in each of the two most recent years</li>
                <li>• Joint income with spouse exceeding $300,000 in each of the two most recent years</li>
                <li>• Reasonable expectation of reaching the same income level in the current year</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Net Worth Test</h3>
              <p className="text-gray-700 mb-2">You qualify if you have:</p>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li>• Individual net worth exceeding $1,000,000</li>
                <li>• Joint net worth with spouse exceeding $1,000,000</li>
                <li>• Net worth calculation excludes the value of your primary residence</li>
                <li>• Calculation is made at the time of investment</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Qualifications</h3>
              <p className="text-gray-700 mb-2">You qualify if you hold certain professional certifications:</p>
              <ul className="space-y-2 text-gray-700">
                <li>• Series 7, 65, or 82 licenses in good standing</li>
                <li>• Knowledgeable employees of private funds</li>
                <li>• Directors, executive officers, or general partners of the issuer</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🏢 Entity Accreditation</h2>
              
              <p className="text-gray-700 mb-4">Certain entities may also qualify as accredited investors:</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Financial Institutions</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Banks, credit unions, insurance companies</li>
                    <li>• Registered investment companies</li>
                    <li>• Business development companies</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Large Entities</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Organizations with assets exceeding $5 million</li>
                    <li>• Entities owned entirely by accredited investors</li>
                    <li>• Certain trusts with assets over $5 million</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Investment Entities</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Private funds and hedge funds</li>
                    <li>• Venture capital funds</li>
                    <li>• Family offices with $5M+ in assets under management</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Self-Certification Process</h2>
              
              <p className="text-gray-700 mb-4">
                Investors typically self-certify their accredited status when participating in private offerings:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-fundry-orange rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Review Criteria</h4>
                    <p className="text-gray-700 text-sm">Carefully review all accreditation requirements</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-fundry-orange rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Assess Qualifications</h4>
                    <p className="text-gray-700 text-sm">Determine if you meet income, net worth, or professional criteria</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-fundry-orange rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Complete Certification</h4>
                    <p className="text-gray-700 text-sm">Provide truthful certification of your status when required</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-fundry-orange rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Maintain Records</h4>
                    <p className="text-gray-700 text-sm">Keep documentation supporting your accredited status</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">⚖️ Legal Considerations</h2>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Truthful Certification Required</h4>
                  <p className="text-yellow-700 text-sm">
                    Providing false information about accredited investor status may violate federal securities laws. 
                    Always provide accurate and truthful information.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Verification May Be Required</h4>
                  <p className="text-blue-700 text-sm">
                    Issuers may require documentation to verify accredited investor status, including 
                    tax returns, bank statements, or professional certifications.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">No Investment Protection</h4>
                  <p className="text-red-700 text-sm">
                    Accredited investor status does not provide protection against investment losses. 
                    All private investments remain high-risk and speculative.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🏠 Fundry and Accreditation</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Current Platform Approach</h3>
                  <p className="text-gray-700 mb-3">
                    Fundry currently focuses on smaller investment amounts that may be accessible to 
                    non-accredited investors under certain regulatory exemptions. However, specific 
                    requirements can vary based on:
                  </p>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Investment amount and structure</li>
                    <li>• State regulations where you reside</li>
                    <li>• Specific exemption being utilized</li>
                    <li>• Company's fundraising approach</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">When Accreditation May Be Required</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Certain higher-value investment opportunities</li>
                    <li>• Specific types of securities offerings</li>
                    <li>• Investments exceeding regulatory thresholds</li>
                    <li>• State-specific requirements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Additional Resources</h2>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">SEC Resources</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• SEC Investor.gov - Accredited Investor Definition</li>
                    <li>• Form D Filing Database</li>
                    <li>• SEC Rules 501-506 (Regulation D)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Professional Guidance</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Consult qualified securities attorneys</li>
                    <li>• Speak with licensed financial advisors</li>
                    <li>• Review with tax professionals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              
              <p className="text-gray-700 mb-4">
                For questions about investor accreditation requirements:
              </p>

              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@fundry.com</p>
                <p><strong>Address:</strong> 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) FUNDRY-1</p>
              </div>

              <p className="text-gray-700 mt-4">
                For accreditation-related questions, please mark your communication as "Accreditation Question" 
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