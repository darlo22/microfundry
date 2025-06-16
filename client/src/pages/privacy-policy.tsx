import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Privacy Policy" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: December 16, 2024
          </p>
          <p className="text-gray-600 mt-2">
            This Privacy Policy describes how Fundry collects, uses, and protects your information.
          </p>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-3 text-fundry-orange" size={24} />
              Privacy at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Lock className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
                <p className="text-sm text-gray-600">We encrypt all data and never sell your personal information</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Control</h3>
                <p className="text-sm text-gray-600">You can access, update, or delete your data at any time</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Database className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Minimal Collection</h3>
                <p className="text-sm text-gray-600">We only collect data necessary for platform functionality</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
              <p className="text-gray-700 mb-4">
                When you create an account, we collect basic information including your name, email address, 
                and user type (founder or investor). This information is provided through Replit's authentication system.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Campaign Information</h3>
              <p className="text-gray-700 mb-4">
                For founders creating campaigns, we collect business information including company details, 
                funding goals, pitch materials, and SAFE agreement terms. This information is used to 
                create and manage your fundraising campaign.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Information</h3>
              <p className="text-gray-700 mb-4">
                For investors, we collect investment amounts, payment information (processed securely through 
                third-party payment processors), and signed agreement documents.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Data</h3>
              <p className="text-gray-700">
                We automatically collect information about how you use our platform, including pages visited, 
                features used, and time spent on the platform. This helps us improve our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Platform Operations</h3>
                  <p className="text-gray-700">
                    We use your information to provide and maintain our platform services, including 
                    campaign management, investment processing, and user support.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Communication</h3>
                  <p className="text-gray-700">
                    We send important updates about your campaigns, investments, and account security. 
                    You may also receive educational content and platform updates.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Legal Compliance</h3>
                  <p className="text-gray-700">
                    We use information to comply with legal requirements, including securities regulations 
                    and anti-money laundering laws.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Platform Improvement</h3>
                  <p className="text-gray-700">
                    We analyze usage patterns to improve our platform features and user experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Campaign Visibility</h3>
                  <p className="text-gray-700">
                    Campaign information is only shared with investors who have access to the private 
                    campaign link. We do not publicly list campaigns or share them without your consent.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Service Providers</h3>
                  <p className="text-gray-700">
                    We share information with trusted service providers who help us operate our platform, 
                    including payment processors, cloud hosting providers, and email services.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Legal Requirements</h3>
                  <p className="text-gray-700">
                    We may disclose information when required by law, such as in response to court orders, 
                    subpoenas, or regulatory requests.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Business Transfers</h3>
                  <p className="text-gray-700">
                    In the event of a merger, acquisition, or sale of assets, user information may be 
                    transferred as part of the business transaction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>

              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• <strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                <li>• <strong>Access Controls:</strong> Strict access controls limit who can view your information</li>
                <li>• <strong>Regular Audits:</strong> We conduct regular security audits and assessments</li>
                <li>• <strong>Payment Security:</strong> Payment information is processed by PCI-compliant providers</li>
                <li>• <strong>Monitoring:</strong> Continuous monitoring for suspicious activity and security threats</li>
              </ul>

              <p className="text-gray-700">
                While we take extensive measures to protect your information, no system is completely secure. 
                We encourage you to use strong passwords and keep your account information confidential.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Access and Updates</h3>
                  <p className="text-gray-700">
                    You can access and update your account information through your dashboard at any time.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Deletion</h3>
                  <p className="text-gray-700">
                    You can request deletion of your account and associated data. Note that some information 
                    may be retained for legal compliance purposes.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Communication Preferences</h3>
                  <p className="text-gray-700">
                    You can manage your email preferences and opt out of non-essential communications.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Portability</h3>
                  <p className="text-gray-700">
                    You can request a copy of your data in a machine-readable format.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience on our platform:
              </p>

              <ul className="space-y-2 text-gray-700 mb-4">
                <li>• <strong>Essential Cookies:</strong> Required for platform functionality and security</li>
                <li>• <strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>

              <p className="text-gray-700">
                You can control cookie settings through your browser, though disabling certain cookies 
                may affect platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. International Users</h2>
              
              <p className="text-gray-700 mb-4">
                Fundry is based in the United States. If you are accessing our services from outside the US, 
                your information may be transferred to and processed in the United States.
              </p>

              <p className="text-gray-700">
                We comply with applicable data protection laws and implement appropriate safeguards for 
                international data transfers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
              
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of significant 
                changes by email or through platform notifications.
              </p>

              <p className="text-gray-700">
                Continued use of our platform after changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
              
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>

              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@fundry.com</p>
                <p><strong>Address:</strong> 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) FUNDRY-1</p>
              </div>

              <p className="text-gray-700 mt-4">
                For urgent privacy concerns, please mark your communication as "Privacy Request" 
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