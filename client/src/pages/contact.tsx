import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MessageCircle, 
  Clock, 
  MapPin,
  Phone,
  Send,
  CheckCircle,
  Users,
  Headphones,
  Calendar
} from "lucide-react";

export default function Contact() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help with your account, campaigns, or general questions",
      contact: "support@fundry.com",
      responseTime: "< 4 hours",
      color: "bg-fundry-orange"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team for immediate assistance",
      contact: "Available 9 AM - 6 PM EST",
      responseTime: "< 2 minutes",
      color: "bg-fundry-navy"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our fundraising experts",
      contact: "+1 (555) FUNDRY-1",
      responseTime: "Business hours",
      color: "bg-green-500"
    }
  ];

  const supportCategories = [
    {
      category: "Campaign Setup",
      description: "Help with creating and launching your fundraising campaign",
      topics: ["Campaign creation", "SAFE terms configuration", "Document uploads", "Launch preparation"]
    },
    {
      category: "Technical Support", 
      description: "Technical issues with the platform or your account",
      topics: ["Login issues", "Payment problems", "Bug reports", "Performance issues"]
    },
    {
      category: "Legal Questions",
      description: "Questions about SAFE agreements and legal compliance",
      topics: ["SAFE terms", "Legal compliance", "Document templates", "Regulatory questions"]
    },
    {
      category: "Business Development",
      description: "Strategic guidance for your fundraising journey",
      topics: ["Fundraising strategy", "Investor relations", "Growth planning", "Partnership opportunities"]
    }
  ];

  const officeLocations = [
    {
      city: "San Francisco",
      address: "123 Market Street, Suite 456",
      zipCode: "San Francisco, CA 94105",
      phone: "+1 (415) 555-0123",
      isPrimary: true
    },
    {
      city: "New York", 
      address: "456 Broadway, Floor 12",
      zipCode: "New York, NY 10013",
      phone: "+1 (212) 555-0456",
      isPrimary: false
    },
    {
      city: "Austin",
      address: "789 Congress Ave, Suite 200",
      zipCode: "Austin, TX 78701", 
      phone: "+1 (512) 555-0789",
      isPrimary: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Contact Us" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about fundraising on Fundry? Our team of experts 
            is here to help you succeed at every step of your journey.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${method.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">{method.contact}</div>
                  <Badge variant="secondary" className="text-xs">
                    Response time: {method.responseTime}
                  </Badge>
                </div>
                <Button className="w-full mt-4 bg-fundry-orange hover:bg-orange-600">
                  Contact Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="mr-3 text-fundry-orange" size={24} />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input placeholder="Enter your first name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input placeholder="Enter your last name" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input type="email" placeholder="your.email@company.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company (Optional)
                </label>
                <Input placeholder="Your company name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-fundry-orange focus:border-fundry-orange">
                  <option>Select a topic</option>
                  <option>Campaign Setup Help</option>
                  <option>Technical Support</option>
                  <option>Legal Questions</option>
                  <option>Business Development</option>
                  <option>Partnership Inquiries</option>
                  <option>Press & Media</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea 
                  placeholder="Tell us how we can help you..."
                  rows={4}
                />
              </div>

              <Button className="w-full bg-fundry-orange hover:bg-orange-600">
                <Send className="mr-2" size={16} />
                Send Message
              </Button>

              <p className="text-xs text-gray-500 text-center">
                We'll get back to you within 4 hours during business hours.
              </p>
            </CardContent>
          </Card>

          {/* Support Categories */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How Can We Help?
            </h2>
            <div className="space-y-4">
              {supportCategories.map((category, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.category}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {category.topics.map((topic, topicIndex) => (
                        <Badge key={topicIndex} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Office Locations */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-3 text-fundry-orange" size={24} />
              Our Offices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {officeLocations.map((office, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{office.city}</h3>
                    {office.isPrimary && (
                      <Badge className="ml-2 bg-fundry-orange text-white">HQ</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-gray-600">
                    <p>{office.address}</p>
                    <p>{office.zipCode}</p>
                    <p className="font-medium">{office.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Hours & FAQ */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-3 text-fundry-orange" size={24} />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Saturday</span>
                  <span className="font-medium">10:00 AM - 2:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle size={16} className="mr-2" />
                  <span className="font-medium">We're currently online</span>
                </div>
                <p className="text-sm text-gray-600">
                  Live chat and phone support available now
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Headphones className="mr-3 text-fundry-orange" size={24} />
                Quick Help
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Need immediate help?</h4>
                  <p className="text-sm text-gray-600">Check our comprehensive FAQ section for instant answers to common questions.</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    View FAQs
                  </Button>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Schedule a consultation</h4>
                  <p className="text-sm text-gray-600">Book a 1-on-1 session with our fundraising experts.</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Calendar className="mr-2" size={14} />
                    Book Meeting
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Phone className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Critical Issues
                </h3>
                <p className="text-gray-700 mb-4">
                  If you're experiencing critical issues affecting active campaigns 
                  or investor funds, contact our emergency support line immediately.
                </p>
                <div className="flex items-center space-x-4">
                  <Button className="bg-red-500 hover:bg-red-600">
                    Emergency Support: +1 (555) 911-FUND
                  </Button>
                  <span className="text-sm text-gray-600">Available 24/7</span>
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