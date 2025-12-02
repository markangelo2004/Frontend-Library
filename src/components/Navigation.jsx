import React from 'react';
import './Navigation.css';

export const Navigation = ({ activeSection, setActiveSection }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">🏨 Hotel Management System</h1>
        <ul className="nav-menu">
          <li>
            <button
              className={`nav-link ${activeSection === 'rooms' ? 'active' : ''}`}
              onClick={() => setActiveSection('rooms')}
            >
              Rooms
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${activeSection === 'guests' ? 'active' : ''}`}
              onClick={() => setActiveSection('guests')}
            >
              Guests
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${activeSection === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveSection('bookings')}
            >
              Bookings
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};
