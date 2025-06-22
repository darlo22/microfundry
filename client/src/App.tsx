function App() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Fundry
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            The premier micro-investment platform for startup funding
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">For Founders</h3>
              <p className="text-gray-600">
                Raise capital from investors who believe in your vision
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">For Investors</h3>
              <p className="text-gray-600">
                Discover promising startups and invest in the future
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Secure Platform</h3>
              <p className="text-gray-600">
                Built with enterprise-grade security and compliance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;