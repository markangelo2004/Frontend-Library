import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBook, FaUsers, FaExchangeAlt, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import './Navigation.css';

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand / Logo */}
        <div className="nav-brand">
          <FaBook className="nav-icon" />
          <span className="nav-title">Library Management</span>
        </div>

        {/* Navigation Links */}
        <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={handleLinkClick}
            end
          >
            <FaHome className="nav-link-icon" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/books" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={handleLinkClick}
          >
            <FaBook className="nav-link-icon" />
            <span>Books</span>
          </NavLink>
          
          <NavLink 
            to="/members" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={handleLinkClick}
          >
            <FaUsers className="nav-link-icon" />
            <span>Members</span>
          </NavLink>
          
          <NavLink 
            to="/loans" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            onClick={handleLinkClick}
          >
            <FaExchangeAlt className="nav-link-icon" />
            <span>Loans</span>
          </NavLink>
        </div>

        {/* Hamburger Menu Button (mobile only) */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMenu}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
