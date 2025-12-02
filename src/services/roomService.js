import api from './api';

export const roomService = {
  getAllRooms: () => api.get('/rooms'),
  getRoomById: (id) => api.get(`/rooms/${id}`),

  createRoom: (roomData) =>
    api.post('/rooms', roomData, {
      headers: { "Content-Type": "application/json" }
    }),

  updateRoom: (id, roomData) =>
    api.put(`/rooms/${id}`, roomData, {
      headers: { "Content-Type": "application/json" }
    }),

  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};
