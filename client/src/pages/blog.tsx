import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowRight,
  Search,
  TrendingUp,
  BookOpen,
  Share
} from "lucide-react";

export default function Blog() {
  const featuredPost = {
    title: "The Complete Guide to SAFE Agreements in 2025",
    excerpt: "Everything founders and investors need to know about Simple Agreement for Future Equity, including new trends and best practices for early-stage fundraising.",
    author: "Sarah Chen",
    date: "December 15, 2024",
    readTime: "8 min read",
    category: "Legal",
    image: "/api/placeholder/600/300"
  };

  const blogPosts = [
    {
      title: "10 Common Fundraising Mistakes and How to Avoid Them",
      excerpt: "Learn from the experiences of successful founders who navigated common pitfalls in their fundraising journey.",
      author: "Marcus Rodriguez",
      date: "December 10, 2024",
      readTime: "6 min read",
      category: "Fundraising",
      tags: ["Strategy", "Tips"]
    },
    {
      title: "Building Investor Relationships That Last",
      excerpt: "How to cultivate meaningful relationships with your investors beyond just the initial funding round.",
      author: "Dr. Emily Watson",
      date: "December 8, 2024", 
      readTime: "5 min read",
      category: "Investor Relations",
      tags: ["Relationships", "Growth"]
    },
    {
      title: "Valuation Caps vs. Discount Rates: What's Best for Your Startup?",
      excerpt: "A deep dive into SAFE terms and how to structure them to benefit both founders and investors.",
      author: "James Kim",
      date: "December 5, 2024",
      readTime: "7 min read",
      category: "Legal",
      tags: ["SAFE", "Terms"]
    },
    {
      title: "The Rise of Network-Based Fundraising",
      excerpt: "Why more founders are turning to their personal and professional networks for early-stage capital.",
      author: "Alex Thompson",
      date: "December 1, 2024",
      readTime: "4 min read",
      category: "Trends",
      tags: ["Networks", "Strategy"]
    },
    {
      title: "Creating a Compelling Pitch Deck That Gets Results",
      excerpt: "The essential elements of a pitch deck that resonates with investors and drives investment decisions.",
      author: "Lisa Martinez",
      date: "November 28, 2024",
      readTime: "9 min read",
      category: "Fundraising",
      tags: ["Pitch Deck", "Strategy"]
    },
    {
      title: "Legal Compliance for Early-Stage Startups",
      excerpt: "Navigate the complex legal landscape of early-stage fundraising with confidence and clarity.",
      author: "David Park",
      date: "November 25, 2024",
      readTime: "6 min read",
      category: "Legal",
      tags: ["Compliance", "Legal"]
    }
  ];

  const categories = [
    { name: "All Posts", count: 24, active: true },
    { name: "Fundraising", count: 8, active: false },
    { name: "Legal", count: 6, active: false },
    { name: "Investor Relations", count: 5, active: false },
    { name: "Trends", count: 3, active: false },
    { name: "Case Studies", count: 2, active: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Blog" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fundry Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Expert insights, practical guides, and success stories to help you 
            navigate the world of early-stage fundraising.
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search articles..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map((category, index) => (
            <Badge
              key={index}
              variant={category.active ? "default" : "secondary"}
              className={`cursor-pointer px-4 py-2 ${
                category.active 
                  ? "bg-fundry-orange text-white" 
                  : "hover:bg-gray-200"
              }`}
            >
              {category.name} ({category.count})
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        <Card className="mb-12 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-fundry-orange to-orange-600 p-8 flex items-center justify-center">
                <div className="text-white text-center">
                  <Badge className="bg-white text-fundry-orange mb-4">Featured</Badge>
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{featuredPost.title}</h2>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <Badge variant="outline">{featuredPost.category}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    {featuredPost.readTime}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-fundry-orange rounded-full flex items-center justify-center mr-3">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="text-sm text-gray-600">{featuredPost.author}</span>
                  </div>
                  
                  <Button className="bg-fundry-orange hover:bg-orange-600">
                    Read Article
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{post.category}</Badge>
                  <Button variant="ghost" size="sm">
                    <Share size={14} />
                  </Button>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User size={14} className="mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {post.date}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mb-16">
          <Button variant="outline" className="px-8">
            Load More Articles
          </Button>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-fundry-navy to-blue-800 text-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Stay Updated with Fundry Insights
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Get the latest fundraising strategies, legal updates, and success stories 
              delivered directly to your inbox every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                placeholder="Enter your email address"
                className="bg-white text-gray-900"
              />
              <Button className="bg-fundry-orange hover:bg-orange-600 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-3">
              Join 5,000+ founders and investors. Unsubscribe anytime.
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}