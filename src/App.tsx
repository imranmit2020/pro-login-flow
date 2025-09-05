import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Index";
import Auth from "./pages/Auth";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Suspense fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/signin" element={<Auth />} />
            <Route path="/auth/signup" element={<Auth />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;