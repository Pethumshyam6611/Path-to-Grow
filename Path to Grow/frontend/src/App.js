import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard"; // ✅ Import Dashboard
import CvAnalysis from "./pages/CvAnalysis"; // This line should import CvAnalysis

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cv-analysis" element={<CvAnalysis />} /> {/* Add this line */}
      </Routes>
    </Router>
  );
}

export default App;
