import { createRoot } from "react-dom/client";

function TestApp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Fundry Test Page</h1>
        <p className="text-gray-600">Application is loading successfully!</p>
        <button 
          onClick={() => window.location.href = '/landing'}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Go to Landing Page
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<TestApp />);