// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation.jsx';
import Home from './components/Home.jsx';
import RpidTagPage from './components/RpidTagPage.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rpid-tag" element={<RpidTagPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
