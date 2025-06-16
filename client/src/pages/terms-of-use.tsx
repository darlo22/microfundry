import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, Scale, Shield } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Terms of Use" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-fundry-navy rounded-lg flex items-center justify-center mx-auto mb-4">
            <Scale className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-lg text-gray-600">
            Last updated: December 16, 2024
          </p>
          <p className="text-gray-600 mt-2">
            These Terms of Use govern your access to and use of the Fundry platform.
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="text-orange-500 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Legal Notice</h3>
                <p className="text-gray-700">
                  By using Fundry, you agree to these Terms of Use and acknowledge that you understand 
                  the risks associated with early-stage investments. Please read these terms carefully 
                  before using our platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              
              <p className="text-gray-700 mb-4">
                By accessing or using the Fundry platform ("Platform"), you agree to be bound by these 
                Terms of Use ("Terms"). If you do not agree to these Terms, you may not use the Platform.
              </p>

              <p className="text-gray-700 mb-4">
                These Terms apply to all users, including founders seeking investment and investors 
                participating in fundraising campaigns.
              </p>

              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. Continued use of the Platform 
                after changes constitutes acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Platform Description</h2>
              
              <p className="text-gray-700 mb-4">
                Fundry is a technology platform that facilitates private fundraising activities 
                between startup founders and investors through Simple Agreement for Future Equity (SAFE) instruments.
              </p>

              <p className="text-gray-700 mb-4">
                <strong>For Founders:</strong> The Platform allows you to create private fundraising 
                campaigns, share them with your network, and collect investments through standardized SAFE agreements.
              </p>

              <p className="text-gray-700">
                <strong>For Investors:</strong> The Platform allows you to view private campaigns, 
                make investments, and manage your investment portfolio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Eligibility</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">General Requirements</h3>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• You must be at least 18 years old</li>
                <li>• You must have the legal capacity to enter into contracts</li>
                <li>• You must provide accurate and complete information</li>
                <li>• You must comply with all applicable laws and regulations</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Founder Requirements</h3>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• You must be authorized to represent the company seeking investment</li>
                <li>• Your company must be legally formed and in good standing</li>
                <li>• You must have authority to enter into SAFE agreements on behalf of your company</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Investor Requirements</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• You must meet applicable investor qualification requirements</li>
                <li>• You must understand the risks of early-stage investments</li>
                <li>• You must have the financial ability to bear the risk of loss</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Registration and Security</h2>
              
              <p className="text-gray-700 mb-4">
                You must create an account to use the Platform. Account creation is handled through 
                Replit's authentication system, and you agree to comply with Replit's terms of service.
              </p>

              <p className="text-gray-700 mb-4">
                You are responsible for:
              </p>

              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• Maintaining the confidentiality of your account credentials</li>
                <li>• All activities that occur under your account</li>
                <li>• Immediately notifying us of any unauthorized use</li>
                <li>• Keeping your account information accurate and up-to-date</li>
              </ul>

              <p className="text-gray-700">
                We reserve the right to suspend or terminate accounts that violate these Terms 
                or engage in fraudulent activity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Platform Fees</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fee Structure</h3>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• <strong>Free Tier:</strong> No fees for campaigns raising under $1,000</li>
                <li>• <strong>Standard Fee:</strong> 5% platform fee on amounts raised above $1,000</li>
                <li>• <strong>Payment Processing:</strong> Additional fees may apply based on payment method</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fee Collection</h3>
              <p className="text-gray-700 mb-4">
                Platform fees are automatically deducted from successfully raised funds before 
                transfer to the founder's account. Fees are non-refundable except as required by law.
              </p>

              <p className="text-gray-700">
                We reserve the right to modify our fee structure with 30 days' notice to users.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
              
              <p className="text-gray-700 mb-4">
                You may not use the Platform for any unlawful purpose or in violation of these Terms. 
                Prohibited activities include:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fraudulent Activities</h3>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Providing false or misleading information</li>
                    <li>• Misrepresenting investment opportunities</li>
                    <li>• Using fake identities or credentials</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Technical Violations</h3>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Attempting to circumvent security measures</li>
                    <li>• Reverse engineering or copying our technology</li>
                    <li>• Interfering with platform operations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Legal Violations</h3>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Violating securities laws or regulations</li>
                    <li>• Money laundering or terrorist financing</li>
                    <li>• Tax evasion or fraud</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Investment Risks and Disclaimers</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-red-500 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">High Risk Investment Warning</h3>
                    <p className="text-red-800 text-sm">
                      Early-stage investments are highly speculative and involve significant risk of loss. 
                      You should only invest amounts you can afford to lose entirely.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Risks</h3>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• <strong>Total Loss:</strong> You may lose your entire investment</li>
                <li>• <strong>Illiquidity:</strong> Investments may not be easily sold or transferred</li>
                <li>• <strong>Dilution:</strong> Future funding rounds may reduce your ownership percentage</li>
                <li>• <strong>No Guarantee:</strong> No guarantee of returns or successful business outcomes</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Disclaimers</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Fundry does not provide investment advice or recommendations</li>
                <li>• We do not verify the accuracy of campaign information</li>
                <li>• Investment decisions are solely your responsibility</li>
                <li>• Past performance does not guarantee future results</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Rights</h3>
              <p className="text-gray-700 mb-4">
                The Platform, including all software, content, and intellectual property, is owned by 
                Fundry and protected by copyright, trademark, and other laws.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">User Content</h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of content you submit to the Platform. By submitting content, 
                you grant us a license to use, display, and distribute it as necessary to provide our services.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Restrictions</h3>
              <p className="text-gray-700">
                You may not copy, modify, distribute, or create derivative works based on our Platform 
                without written permission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, FUNDRY SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>

              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• Loss of profits, revenue, or business opportunities</li>
                <li>• Investment losses or poor investment performance</li>
                <li>• Data loss or corruption</li>
                <li>• Business interruption or system downtime</li>
              </ul>

              <p className="text-gray-700">
                Our total liability to you shall not exceed the fees paid to us in the 12 months 
                preceding the claim.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law and Disputes</h2>
              
              <p className="text-gray-700 mb-4">
                These Terms are governed by the laws of the State of California, without regard to 
                conflict of law principles.
              </p>

              <p className="text-gray-700 mb-4">
                Any disputes arising from these Terms or your use of the Platform shall be resolved 
                through binding arbitration in San Francisco, California, except for claims involving 
                intellectual property or injunctive relief.
              </p>

              <p className="text-gray-700">
                You waive your right to participate in class action lawsuits or class-wide arbitration.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
              
              <p className="text-gray-700 mb-4">
                For questions about these Terms or our Platform, please contact us:
              </p>

              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@fundry.com</p>
                <p><strong>Address:</strong> 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) FUNDRY-1</p>
              </div>

              <p className="text-gray-700 mt-4">
                For urgent legal matters, please mark your communication as "Legal - Urgent" 
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