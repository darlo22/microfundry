import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Settings, Eye, Shield } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Cookie Policy" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
            <Cookie className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🍪 Cookie Policy</h1>
          <p className="text-lg text-gray-600">
            Effective Date: June 17, 2025
          </p>
          <p className="text-gray-600 mt-2">
            This Cookie Policy explains how Fundry uses cookies and similar technologies when you visit our platform.
          </p>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-3 text-fundry-orange" size={24} />
              Cookie Usage at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Essential Only</h3>
                <p className="text-sm text-gray-600">We use essential cookies for platform functionality and security</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Settings className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Control</h3>
                <p className="text-sm text-gray-600">You can manage cookie preferences through browser settings</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Eye className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No Tracking</h3>
                <p className="text-sm text-gray-600">We don't use third-party advertising or tracking cookies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1️⃣ What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are stored on your device when you visit a website. They help websites remember information about your visit, such as your preferred language and other settings.
              </p>
              <p className="text-gray-700">
                Cookies make your browsing experience more efficient and can help provide better, more personalized services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2️⃣ How We Use Cookies</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Essential Cookies</h3>
              <p className="text-gray-700 mb-4">These cookies are necessary for the platform to function properly:</p>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li>• Session management and user authentication</li>
                <li>• Security features and fraud prevention</li>
                <li>• Platform functionality and user preferences</li>
                <li>• Form data persistence during multi-step processes</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Cookies</h3>
              <p className="text-gray-700 mb-4">These cookies help us understand how users interact with our platform:</p>
              <ul className="space-y-2 text-gray-700">
                <li>• Page load times and performance monitoring</li>
                <li>• Error tracking and technical issue identification</li>
                <li>• Basic usage analytics (anonymized)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3️⃣ Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-fundry-orange pl-4">
                  <h4 className="font-semibold text-gray-900">Session Cookies</h4>
                  <p className="text-gray-700 text-sm">Temporary cookies that expire when you close your browser</p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Persistent Cookies</h4>
                  <p className="text-gray-700 text-sm">Remain on your device until they expire or are deleted</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">First-Party Cookies</h4>
                  <p className="text-gray-700 text-sm">Set directly by Fundry for platform functionality</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4️⃣ Cookie Details</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left">Cookie Name</th>
                      <th className="border border-gray-300 p-3 text-left">Purpose</th>
                      <th className="border border-gray-300 p-3 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono">session_id</td>
                      <td className="border border-gray-300 p-3">User authentication and session management</td>
                      <td className="border border-gray-300 p-3">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono">csrf_token</td>
                      <td className="border border-gray-300 p-3">Cross-site request forgery protection</td>
                      <td className="border border-gray-300 p-3">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-mono">user_preferences</td>
                      <td className="border border-gray-300 p-3">Store user interface preferences</td>
                      <td className="border border-gray-300 p-3">30 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5️⃣ Managing Your Cookie Preferences</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
              <p className="text-gray-700 mb-4">You can control cookies through your browser settings:</p>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li>• <strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                <li>• <strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                <li>• <strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                <li>• <strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Disabling essential cookies may prevent you from using certain features of our platform, including user authentication and investment functionality.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6️⃣ Third-Party Services</h2>
              
              <p className="text-gray-700 mb-4">We may use limited third-party services that set their own cookies:</p>
              <ul className="space-y-2 text-gray-700">
                <li>• Payment processors (for secure transaction processing)</li>
                <li>• Analytics services (for platform performance monitoring)</li>
                <li>• Security services (for fraud prevention and protection)</li>
              </ul>
              
              <p className="text-gray-700 mt-4">
                These services have their own cookie policies, and we encourage you to review them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7️⃣ Updates to This Policy</h2>
              
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify users of any significant changes through our platform or via email.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              
              <p className="text-gray-700 mb-4">
                If you have questions about our use of cookies, please contact us:
              </p>

              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@fundry.com</p>
                <p><strong>Address:</strong> 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) FUNDRY-1</p>
              </div>

              <p className="text-gray-700 mt-4">
                For cookie-related inquiries, please mark your communication as "Cookie Policy Question" 
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