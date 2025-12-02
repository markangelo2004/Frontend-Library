import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { guestService } from '../../services/guestService';
import { roomService } from '../../services/roomService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { BookingForm } from './BookingForm';
import { safeExtractArray } from '../../utils/dataHelper';
import './BookingList.css';

export const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingRes, guestRes, roomRes] = await Promise.all([
        bookingService.getAllBookings(),
        guestService.getAllGuests(),
        roomService.getAllRooms(),
      ]);

      console.log('📥 API Responses:', {
        bookings: bookingRes.data,
        guests: guestRes.data,
        rooms: roomRes.data,
      });

      // ✅ Safely extract arrays
      const bookingsData = safeExtractArray(bookingRes.data, 'bookings');
      const guestsData = safeExtractArray(guestRes.data, 'guests');
      const roomsData = safeExtractArray(roomRes.data, 'rooms');

      setBookings(bookingsData);
      setGuests(guestsData);
      setRooms(roomsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('❌ Error fetching data:', err);
      setBookings([]);
      setGuests([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const getGuestName = (guest) => {
    if (!guest) return 'Unknown Guest';

    // If populated
    if (typeof guest === 'object' && guest.name) return guest.name;

    // If only ID string
    const found = guests.find(g => g._id === guest);
    return found ? found.name : 'Unknown Guest';
  };


  const getRoomNumber = (room) => {
    if (!room) return 'Unknown Room';

    // If populated
    if (typeof room === 'object' && room.number) return `Room ${room.number}`;

    // If only ID string
    const found = rooms.find(r => r._id === room);
    return found ? `Room ${found.number}` : 'Unknown Room';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.deleteBooking(id);
        setBookings(bookings.filter(booking => booking._id !== id));
      } catch (err) {
        alert('Failed to cancel booking');
        console.error('❌ Error deleting booking:', err);
      }
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setSelectedBooking(null);
    setShowModal(true);
  };

  const handleFormSubmit = () => {
    fetchData();
    setShowModal(false);
  };

  // ✅ Ensure filteredBookings is always an array
  const filteredBookings = Array.isArray(bookings)
    ? filterStatus === 'all'
      ? bookings
      : bookings.filter(booking => booking.status === filterStatus)
    : [];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="booking-list-container">
      <div className="list-header">
        <h2>Booking Management</h2>
        <div className="header-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked In</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn btn-primary" onClick={handleAddNew}>
            + New Booking
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="bookings-table-container">
        {filteredBookings.length === 0 ? (
          <p className="no-data">
            {filterStatus === 'all' ? 'No bookings found' : `No ${filterStatus} bookings found`}
          </p>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking._id}>
                  <td>{getGuestName(booking.guestId)}</td>
                  <td>{getRoomNumber(booking.roomId)}</td>
                  <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </span>
                  </td>
                  <td>${booking.totalPrice}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEdit(booking)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(booking._id)}
                      >
                        ❌ Cancel
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
        title={selectedBooking ? 'Edit Booking' : 'New Booking'}
        onClose={() => setShowModal(false)}
      >
        <BookingForm
          booking={selectedBooking}
          guests={guests}
          rooms={rooms}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};
