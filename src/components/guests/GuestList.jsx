import React, { useState, useEffect } from 'react';
import { guestService } from '../../services/guestService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { GuestForm } from './GuestForm';
import './GuestList.css';

export const GuestList = () => {
  const [guests, setGuests] = useState([]);  // ✅ Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const response = await guestService.getAllGuests();
      
      console.log('API Response:', response); // Debug
      console.log('Response Data:', response.data); // Debug
      
      // ✅ FIX: Handle multiple response structures
      let guestsData = [];
      
      if (Array.isArray(response.data)) {
        guestsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        guestsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.guests)) {
        guestsData = response.data.guests; // If API returns { guests: [...] }
      } else if (Array.isArray(response)) {
        guestsData = response;
      }
      
      console.log('Processed Guests Data:', guestsData); // Debug
      
      setGuests(guestsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch guests. Please try again later.');
      console.error('Error fetching guests:', err);
      setGuests([]); // ✅ Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await guestService.deleteGuest(id);
        setGuests(guests.filter(guest => guest._id !== id));
      } catch (err) {
        alert('Failed to delete guest');
        console.error('Error deleting guest:', err);
      }
    }
  };

  const handleEdit = (guest) => {
    setSelectedGuest(guest);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setSelectedGuest(null);
    setShowModal(true);
  };

  const handleFormSubmit = () => {
    fetchGuests();
    setShowModal(false);
  };

  // ✅ FIX: Ensure guests is an array before filtering
  const filteredGuests = Array.isArray(guests)
    ? guests.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="guest-list-container">
      <div className="list-header">
        <h2>Guest Management</h2>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="btn btn-primary" onClick={handleAddNew}>
            + Add New Guest
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="guests-table-container">
        {filteredGuests.length === 0 ? (
          <p className="no-data">
            {searchTerm ? 'No guests match your search' : 'No guests found'}
          </p>
        ) : (
          <table className="guests-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map(guest => (
                <tr key={guest._id}>
                  <td><strong>{guest.name}</strong></td>
                  <td>{guest.email}</td>
                  <td>{guest.phone}</td>
                  <td>{guest.address}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEdit(guest)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(guest._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={selectedGuest ? 'Edit Guest' : 'Add New Guest'}
        onClose={() => setShowModal(false)}
      >
        <GuestForm
          guest={selectedGuest}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};
