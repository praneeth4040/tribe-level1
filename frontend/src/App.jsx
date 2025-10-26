import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ResultPage from './pages/ResultPage';
import Dashboard from './pages/Dashboard';
import ProfileDetails from './pages/ProfileDetails';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfileDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
