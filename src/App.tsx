import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Index";
import Auth from "./pages/Auth";

function App() {
  console.log('App component rendering');
  console.log('Testing Tailwind - this should be styled');
  
  return (
    <Router>
      <div className="min-h-screen bg-red-500 text-white">
        <div className="p-4 bg-blue-500">
          <h1 className="text-2xl font-bold">TAILWIND TEST</h1>
        </div>
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
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