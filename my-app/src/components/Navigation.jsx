// src/components/Navigation.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="navigation">
      <h2>My IoT Dashboard</h2>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/rpid-tag">RPID Tag Page</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
