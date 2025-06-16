import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie, Settings, Shield, BarChart } from "lucide-react";

export default function CookiePolicy() {
  const cookieTypes = [
    {
      name: "Essential Cookies",
      description: "Required for the platform to function properly",
      icon: Shield,
      color: "bg-green-500",
      examples: [
        "Authentication tokens",
        "Session management", 
        "Security preferences",
        "Load balancing"
      ],
      canDisable: false
    },
    {
      name: "Analytics Cookies",
      description: "Help us understand how you use our platform",
      icon: BarChart,
      color: "bg-blue-500",
      examples: [
        "Page views and navigation",
        "Feature usage statistics",
        "Performance metrics",
        "Error tracking"
      ],
      canDisable: true
    },
    {
      name: "Preference Cookies",
      description: "Remember your settings and choices",
      icon: Settings,
      color: "bg-purple-500",
      examples: [
        "Language preferences",
        "Theme settings",
        "Dashboard layout",
        "Notification preferences"
      ],
      canDisable: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Cookie Policy" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-fundry-orange rounded-lg flex items-center justify-center mx-auto mb-4">
            <Cookie className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: December 16, 2024
          </p>
          <p className="text-gray-600 mt-2">
            This Cookie Policy explains how Fundry uses cookies and similar technologies.
          </p>
        </div>

        {/* What Are Cookies */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are stored on your device when you visit a website. 
              They help websites remember information about your visit, such as your preferences 
              and login status.
            </p>

            <p className="text-gray-700 mb-4">
              We also use similar technologies like web beacons, pixels, and local storage to 
              enhance your experience on our platform.
            </p>

            <p className="text-gray-700">
              Cookies and similar technologies help us provide you with a better, faster, 
              and safer experience on Fundry.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Types */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Types of Cookies We Use
          </h2>

          {cookieTypes.map((type, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mr-4`}>
                      <type.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{type.name}</h3>
                      <p className="text-gray-600 text-sm">{type.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {type.canDisable ? (
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Optional
                      </span>
                    ) : (
                      <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-2">Examples include:</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {type.examples.map((example, exampleIndex) => (
                    <li key={exampleIndex} className="text-gray-700 text-sm">
                      • {example}
                    </li>
                  ))}
                </ul>
                
                {type.canDisable && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      You can disable these cookies through your browser settings or our 
                      cookie preference center, though this may affect platform functionality.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How We Use Cookies */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Functionality</h3>
                <p className="text-gray-700">
                  Essential cookies enable core features like user authentication, security, 
                  and basic platform operations. Without these cookies, the platform cannot function properly.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">User Experience</h3>
                <p className="text-gray-700">
                  Preference cookies remember your settings and choices to provide a personalized 
                  experience, such as your dashboard layout and notification preferences.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics and Improvement</h3>
                <p className="text-gray-700">
                  Analytics cookies help us understand how you use our platform, which features 
                  are most valuable, and where we can make improvements.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-gray-700">
                  Security cookies help protect your account and detect suspicious activity, 
                  ensuring a safe environment for fundraising and investing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            
            <p className="text-gray-700 mb-4">
              We work with trusted third-party services that may place their own cookies on your device:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-fundry-orange pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Analytics Services</h3>
                <p className="text-gray-700 text-sm">
                  We use analytics tools to understand platform usage and improve our services.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Payment Processors</h3>
                <p className="text-gray-700 text-sm">
                  Payment processing services may use cookies to facilitate secure transactions.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Authentication</h3>
                <p className="text-gray-700 text-sm">
                  Replit's authentication system uses cookies to manage your login session.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Support Services</h3>
                <p className="text-gray-700 text-sm">
                  Customer support tools may use cookies to provide better assistance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Preference Center</h3>
                <p className="text-gray-700 mb-4">
                  You can manage your cookie preferences at any time through our cookie preference center. 
                  This allows you to enable or disable optional cookies while keeping essential ones active.
                </p>
                <Button className="bg-fundry-orange hover:bg-orange-600">
                  <Settings className="mr-2" size={16} />
                  Manage Cookie Preferences
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
                <p className="text-gray-700 mb-3">
                  You can also control cookies through your browser settings:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                  <li>• <strong>Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</li>
                  <li>• <strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                  <li>• <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
                <p className="text-yellow-700 text-sm">
                  Disabling essential cookies will prevent you from using core platform features, 
                  including logging in, creating campaigns, and making investments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Retention */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Retention</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Cookies</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Temporary cookies that are deleted when you close your browser.
                </p>
                <p className="text-gray-600 text-xs">
                  Used for: Authentication, security, temporary preferences
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Persistent Cookies</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Stored on your device for a specific period (typically 30 days to 2 years).
                </p>
                <p className="text-gray-600 text-xs">
                  Used for: Saved preferences, analytics, remember login
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Automatic Cleanup</h4>
              <p className="text-gray-700 text-sm">
                We automatically remove expired cookies and regularly review our cookie usage 
                to ensure we only collect what's necessary for platform functionality.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Updates and Contact */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates and Contact</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Policy Updates</h3>
                <p className="text-gray-700">
                  We may update this Cookie Policy from time to time to reflect changes in our 
                  practices or legal requirements. We'll notify you of significant changes through 
                  platform notifications or email.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions or Concerns</h3>
                <p className="text-gray-700 mb-4">
                  If you have questions about our cookie practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@fundry.com</p>
                  <p><strong>Subject Line:</strong> Cookie Policy Inquiry</p>
                  <p><strong>Address:</strong> 123 Market Street, Suite 456, San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}