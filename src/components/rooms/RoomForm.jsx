import React, { useState, useEffect } from 'react';
import { roomService } from '../../services/roomService';
import './RoomForm.css';

export const RoomForm = ({ room, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    number: '',
    type: 'single',
    price: '',
    status: 'available',
    capacity: '',
    amenities: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const amenitiesOptions = ['WiFi', 'TV', 'Mini Bar', 'Jacuzzi', 'Balcony', 'Kitchen'];
  const typeOptions = ['single', 'double', 'deluxe', 'suite'];

  useEffect(() => {
    if (room) {
      setFormData(room);
    }
  }, [room]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.number.trim()) newErrors.number = 'Room number is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = 'Valid capacity is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'capacity' ? Number(value) : value,
    }));
  };

  const handleAmenitiesChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      if (room) {
        await roomService.updateRoom(room._id, formData);
      } else {
        await roomService.createRoom(formData);
      }
      onSubmit();
    } catch (err) {
      setErrors({ submit: 'Failed to save room. Please try again.' });
      console.error('Error saving room:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="room-form">
      {errors.submit && <div className="form-error">{errors.submit}</div>}

      <div className="form-group">
        <label>Room Number *</label>
        <input
          type="text"
          name="number"
          value={formData.number}
          onChange={handleInputChange}
          placeholder="Enter room number"
          className={errors.number ? 'input-error' : ''}
        />
        {errors.number && <span className="error-text">{errors.number}</span>}
      </div>

      <div className="form-group">
        <label>Type *</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
        >
          {typeOptions.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Price per Night ($) *</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Enter price"
          min="0"
          step="0.01"
          className={errors.price ? 'input-error' : ''}
        />
        {errors.price && <span className="error-text">{errors.price}</span>}
      </div>

      <div className="form-group">
        <label>Capacity (Guests) *</label>
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleInputChange}
          placeholder="Enter capacity"
          min="1"
          className={errors.capacity ? 'input-error' : ''}
        />
        {errors.capacity && <span className="error-text">{errors.capacity}</span>}
      </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="form-group">
        <label>Amenities</label>
        <div className="amenities-list">
          {amenitiesOptions.map(amenity => (
            <label key={amenity} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={() => handleAmenitiesChange(amenity)}
              />
              {amenity}
            </label>
          ))}
        </div>
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
          disabled={loading}
        >
          {loading ? 'Saving...' : (room ? 'Update Room' : 'Create Room')}
        </button>
      </div>
    </form>
  );
};
