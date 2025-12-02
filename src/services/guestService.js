import api from './api';

export const guestService = {
  getAllGuests: () => api.get('/guests'),
  getGuestById: (id) => api.get(`/guests/${id}`),
  createGuest: (guestData) => api.post('/guests', guestData),
  updateGuest: (id, guestData) => api.put(`/guests/${id}`, guestData),
  deleteGuest: (id) => api.delete(`/guests/${id}`),
};
