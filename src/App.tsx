import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function SimpleTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1 style={{ color: 'darkblue', fontSize: '24px' }}>Simple Test Page</h1>
      <p>If you see this styled text, React is working</p>
      <div className="bg-red-500 text-white p-4 mt-4">
        <p>If this has red background and white text, Tailwind is working</p>
      </div>
    </div>
  );
}

function App() {
  console.log('App rendering - check console');
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleTest />} />
      </Routes>
    </Router>
  );
}

export default App;