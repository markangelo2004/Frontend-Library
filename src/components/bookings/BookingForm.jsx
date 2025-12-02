import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import './BookingForm.css';

export const BookingForm = ({ booking, guests, rooms, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    guestId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    status: 'pending',
    totalPrice: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const statusOptions = ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled'];

  useEffect(() => {
    if (booking) {
      // ✅ FIX: Properly format dates for input fields
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      
      setFormData({
        guestId: booking.guestId?._id || booking.guestId,
        roomId: booking.roomId?._id || booking.roomId,
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0],
        status: booking.status || 'pending',
        totalPrice: booking.totalPrice || '',
        notes: booking.notes || '',
      });
    }
  }, [booking]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.guestId) newErrors.guestId = 'Guest is required';
    if (!formData.roomId) newErrors.roomId = 'Room is required';
    if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!formData.checkOut) newErrors.checkOut = 'Check-out date is required';
    
    // ✅ FIX: Compare dates properly
    if (formData.checkIn && formData.checkOut && formData.checkIn >= formData.checkOut) {
      newErrors.checkOut = 'Check-out date must be after check-in date';
    }
    
    if (!formData.totalPrice || formData.totalPrice <= 0) {
      newErrors.totalPrice = 'Valid total price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalPrice' ? (value ? Number(value) : '') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // ✅ FIX: Send dates in proper ISO format
      const submitData = {
        guestId: formData.guestId,
        roomId: formData.roomId,
        checkIn: formData.checkIn, // API accepts YYYY-MM-DD format
        checkOut: formData.checkOut, // API accepts YYYY-MM-DD format
        status: formData.status,
        totalPrice: Number(formData.totalPrice),
        notes: formData.notes.trim(),
      };

      console.log('📤 Submitting booking data:', submitData);

      if (booking) {
        const response = await bookingService.updateBooking(booking._id, submitData);
        console.log('✅ Booking updated:', response);
      } else {
        const response = await bookingService.createBooking(submitData);
        console.log('✅ Booking created:', response);
      }
      
      onSubmit();
    } catch (err) {
      console.error('❌ Error saving booking:', err.response?.data || err.message);
      setErrors({ 
        submit: err.response?.data?.message || 'Failed to save booking. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Handle empty guests or rooms arrays
  const safeGuests = Array.isArray(guests) ? guests : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      {errors.submit && <div className="form-error">{errors.submit}</div>}

      <div className="form-group">
        <label>Guest *</label>
        <select
          name="guestId"
          value={formData.guestId}
          onChange={handleInputChange}
          className={errors.guestId ? 'input-error' : ''}
          disabled={safeGuests.length === 0}
        >
          <option value="">
            {safeGuests.length === 0 ? 'No guests available' : 'Select a guest'}
          </option>
          {safeGuests.map(guest => (
            <option key={guest._id} value={guest._id}>
              {guest.name} ({guest.email})
            </option>
          ))}
        </select>
        {errors.guestId && <span className="error-text">{errors.guestId}</span>}
      </div>

      <div className="form-group">
        <label>Room *</label>
        <select
          name="roomId"
          value={formData.roomId}
          onChange={handleInputChange}
          className={errors.roomId ? 'input-error' : ''}
          disabled={safeRooms.length === 0}
        >
          <option value="">
            {safeRooms.length === 0 ? 'No rooms available' : 'Select a room'}
          </option>
          {safeRooms.map(room => (
            <option key={room._id} value={room._id}>
              Room {room.number} ({room.type} - ${room.price}/night)
            </option>
          ))}
        </select>
        {errors.roomId && <span className="error-text">{errors.roomId}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Check-In Date *</label>
          <input
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleInputChange}
            className={errors.checkIn ? 'input-error' : ''}
          />
          {errors.checkIn && <span className="error-text">{errors.checkIn}</span>}
        </div>

        <div className="form-group">
          <label>Check-Out Date *</label>
          <input
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleInputChange}
            className={errors.checkOut ? 'input-error' : ''}
          />
          {errors.checkOut && <span className="error-text">{errors.checkOut}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Total Price ($) *</label>
        <input
          type="number"
          name="totalPrice"
          value={formData.totalPrice}
          onChange={handleInputChange}
          placeholder="Enter total price"
          min="0"
          step="0.01"
          className={errors.totalPrice ? 'input-error' : ''}
        />
        {errors.totalPrice && <span className="error-text">{errors.totalPrice}</span>}
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Add any special requests or notes"
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || safeGuests.length === 0 || safeRooms.length === 0}
        >
          {loading ? 'Saving...' : (booking ? 'Update Booking' : 'Create Booking')}
        </button>
      </div>
    </form>
  );
};
