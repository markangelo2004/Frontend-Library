import React, { useState, useEffect } from 'react';
import { roomService } from '../../services/roomService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { RoomForm } from './RoomForm';
import './RoomList.css';

export const RoomList = () => {
  const [rooms, setRooms] = useState([]);  // ✅ Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getAllRooms();
      
      // ✅ FIX: Handle different response structures
      const roomsData = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response.data.data) 
        ? response.data.data 
        : [];
      
      console.log('Rooms data:', roomsData); // Debug log
      setRooms(roomsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch rooms. Please try again later.');
      console.error('Error fetching rooms:', err);
      setRooms([]); // ✅ Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomService.deleteRoom(id);
        setRooms(rooms.filter(room => room._id !== id));
      } catch (err) {
        alert('Failed to delete room');
        console.error('Error deleting room:', err);
      }
    }
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setSelectedRoom(null);
    setShowModal(true);
  };

  const handleFormSubmit = () => {
    fetchRooms();
    setShowModal(false);
  };

  // ✅ FIX: Ensure filteredRooms is always an array
  const filteredRooms = Array.isArray(rooms)
    ? filterStatus === 'all'
      ? rooms
      : rooms.filter(room => room.status === filterStatus)
    : [];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="room-list-container">
      <div className="list-header">
        <h2>Room Management</h2>
        <div className="header-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button className="btn btn-primary" onClick={handleAddNew}>
            + Add New Room
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="rooms-grid">
        {filteredRooms.length === 0 ? (
          <p className="no-data">No rooms found</p>
        ) : (
          filteredRooms.map(room => (
            <div key={room._id} className="room-card">
              <div className="room-header">
                <h3>Room {room.number}</h3>
                <span className={`status-badge status-${room.status}`}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </span>
              </div>
              <div className="room-details">
                <p><strong>Type:</strong> {room.type}</p>
                <p><strong>Price:</strong> ${room.price}/night</p>
                <p><strong>Capacity:</strong> {room.capacity} guests</p>
                <p><strong>Amenities:</strong> {room.amenities.join(', ')}</p>
              </div>
              <div className="room-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(room)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(room._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={selectedRoom ? 'Edit Room' : 'Add New Room'}
        onClose={() => setShowModal(false)}
      >
        <RoomForm
          room={selectedRoom}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};
