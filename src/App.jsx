import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ChapterSelect from './pages/ChapterSelect';
import MockTest from './pages/MockTest';
import Results from './pages/Results';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [testConfig, setTestConfig] = useState(null);
  const [testResults, setTestResults] = useState(null);

  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div className="app-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/select"
                element={<ChapterSelect setTestConfig={setTestConfig} />}
              />
              <Route
                path="/test"
                element={
                  <MockTest
                    testConfig={testConfig}
                    setTestResults={setTestResults}
                  />
                }
              />
              <Route
                path="/results"
                element={<Results results={testResults} />}
              />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </AnimatePresence>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
