function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Invest in the Future with{' '}
              <span className="text-orange-400">$5,000</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Support innovative startups through our equity crowdfunding platform. 
              Minimum investment starts at just $25.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
                Start Investing
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Fundry?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes equity crowdfunding accessible, transparent, and secure for everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl font-bold">$</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Low Minimums</h3>
              <p className="text-gray-600">Start investing with as little as $25</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl font-bold">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-gray-600">Bank-level security for all transactions</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl font-bold">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">High Growth</h3>
              <p className="text-gray-600">Access to pre-vetted startup opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">$2.1M+</div>
              <div className="text-gray-600">Total Funded</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">150+</div>
              <div className="text-gray-600">Startups Funded</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">5,000+</div>
              <div className="text-gray-600">Active Investors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">23%</div>
              <div className="text-gray-600">Average Returns</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of investors supporting the next generation of innovative startups.
          </p>
          <button className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
