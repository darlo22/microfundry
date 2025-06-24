import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Download, 
  Video, 
  FileText, 
  Calculator,
  Users,
  MessageCircle,
  ArrowRight,
  Play,
  Calendar
} from "lucide-react";

export default function Resources() {
  const resourceCategories = [
    {
      title: "Fundraising Guides",
      icon: BookOpen,
      color: "bg-fundry-orange",
      resources: [
        {
          title: "Complete Guide to SAFE Agreements",
          type: "PDF Guide",
          description: "Everything you need to know about Simple Agreement for Future Equity",
          downloadCount: "2.1K downloads"
        },
        {
          title: "Fundraising Timeline Template",
          type: "Excel Template", 
          description: "Step-by-step timeline for planning your fundraising campaign",
          downloadCount: "1.8K downloads"
        },
        {
          title: "Investor Outreach Templates",
          type: "Email Templates",
          description: "Proven email templates for reaching out to potential investors",
          downloadCount: "3.2K downloads"
        }
      ]
    },
    {
      title: "Legal Resources",
      icon: FileText,
      color: "bg-fundry-navy",
      resources: [
        {
          title: "SAFE Agreement Template",
          type: "Legal Document",
          description: "Standard SAFE agreement template with discount and valuation cap",
          downloadCount: "4.5K downloads"
        },
        {
          title: "Term Sheet Template",
          type: "Legal Document",
          description: "Professional term sheet template for early-stage funding",
          downloadCount: "1.9K downloads"
        },
        {
          title: "Cap Table Calculator",
          type: "Excel Tool",
          description: "Calculate equity dilution and ownership percentages",
          downloadCount: "2.7K downloads"
        }
      ]
    },
    {
      title: "Video Tutorials",
      icon: Video,
      color: "bg-green-500",
      resources: [
        {
          title: "Setting Up Your First Campaign",
          type: "Video Tutorial",
          description: "Step-by-step guide to creating and launching your campaign",
          downloadCount: "12 min watch"
        },
        {
          title: "Understanding SAFE Terms",
          type: "Webinar",
          description: "Deep dive into discount rates, valuation caps, and conversion events",
          downloadCount: "25 min watch"
        },
        {
          title: "Investor Relations Best Practices",
          type: "Video Series",
          description: "How to communicate effectively with your investors",
          downloadCount: "6 episodes"
        }
      ]
    }
  ];

  const tools = [
    {
      title: "Valuation Calculator",
      description: "Estimate your company's valuation based on key metrics",
      icon: Calculator,
      color: "bg-purple-500"
    },
    {
      title: "Fundraising Readiness Checklist",
      description: "Ensure you're prepared before launching your campaign",
      icon: FileText,
      color: "bg-blue-500"
    },
    {
      title: "Investor CRM Template",
      description: "Track and manage your investor relationships",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Pitch Deck Template",
      description: "Professional pitch deck template with best practices",
      icon: BookOpen,
      color: "bg-orange-500"
    }
  ];

  const events = [
    {
      title: "Fundraising Fundamentals Workshop",
      date: "January 25, 2025",
      time: "2:00 PM EST",
      type: "Live Workshop",
      description: "Learn the basics of early-stage fundraising and SAFE agreements"
    },
    {
      title: "Investor Relations Masterclass",
      date: "February 8, 2025", 
      time: "1:00 PM EST",
      type: "Masterclass",
      description: "Advanced strategies for managing investor relationships and updates"
    },
    {
      title: "Legal Considerations for Startups",
      date: "February 22, 2025",
      time: "3:00 PM EST", 
      type: "Legal Seminar",
      description: "Navigate legal requirements and compliance for early-stage companies"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Resources" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resources & Learning Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to successfully raise capital, from templates 
            and guides to video tutorials and expert workshops.
          </p>
        </div>

        {/* Resource Categories */}
        {resourceCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-16">
            <div className="flex items-center mb-8">
              <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                <category.icon className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {category.resources.map((resource, resourceIndex) => (
                <Card key={resourceIndex} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Badge className="mb-3" variant="secondary">{resource.type}</Badge>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{resource.downloadCount}</span>
                      <Button size="sm" className="bg-fundry-orange hover:bg-orange-600">
                        <Download size={14} className="mr-2" />
                        {resource.type.includes("Video") ? "Watch" : "Download"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Interactive Tools */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Interactive Tools
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <tool.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Launch Tool
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <Card className="mb-16">
          <CardHeader>
            <div className="flex items-center">
              <Calendar className="mr-3 text-fundry-orange" size={24} />
              <CardTitle className="text-2xl text-gray-900">Upcoming Events</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {events.map((event, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-fundry-orange rounded-lg flex items-center justify-center">
                    <Play className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        {event.title}
                      </h3>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{event.description}</p>
                    <div className="text-sm text-gray-500">
                      {event.date} • {event.time}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Register
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-fundry-navy rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Get answers to the most common questions about fundraising on Fundry
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">For Founders</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">How long does a typical campaign take?</h4>
                    <p className="text-sm text-gray-600 mt-1">Most campaigns close within 30-60 days, depending on network size and engagement.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">What are the platform fees?</h4>
                    <p className="text-sm text-gray-600 mt-1">5% on amounts raised above $1,000. Completely free for campaigns under $1,000.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Can I customize SAFE terms?</h4>
                    <p className="text-sm text-gray-600 mt-1">Yes, you can set discount rates, valuation caps, and other key terms for your campaign.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">For Investors</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">What is the minimum investment?</h4>
                    <p className="text-sm text-gray-600 mt-1">Minimum investments typically range from $500 to $2,500, set by the founder.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">How do SAFE agreements work?</h4>
                    <p className="text-sm text-gray-600 mt-1">SAFEs convert to equity in future funding rounds with investor-friendly terms like discounts.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Are investments secure?</h4>
                    <p className="text-sm text-gray-600 mt-1">Yes, all payments are processed securely and funds are held until campaign completion.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button className="bg-fundry-orange hover:bg-orange-600">
                View All FAQs
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="bg-gradient-to-r from-fundry-navy to-blue-800 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Need Additional Support?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Our team of fundraising experts is here to help you succeed. 
              Get personalized guidance and support throughout your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-fundry-orange hover:bg-orange-600">
                Contact Support
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-fundry-navy">
                Schedule Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}