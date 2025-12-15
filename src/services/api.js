import axios from 'axios';

// Create axios instance with base URL
const API_URL = 'https://backend-library-one.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Books API
export const bookAPI = {
  getAllBooks: (page = 1, limit = 10) => 
    api.get(`/books?page=${page}&limit=${limit}`),
  
  getBookById: (id) => 
    api.get(`/books/${id}`),
  
  createBook: (bookData) => 
    api.post('/books', bookData),
  
  updateBook: (id, bookData) => 
    api.put(`/books/${id}`, bookData),
  
  deleteBook: (id) => 
    api.delete(`/books/${id}`),
};

// Members API
export const memberAPI = {
  getAllMembers: (page = 1, limit = 10) => 
    api.get(`/members?page=${page}&limit=${limit}`),
  
  getMemberById: (id) => 
    api.get(`/members/${id}`),
  
  createMember: (memberData) => 
    api.post('/members', memberData),
  
  updateMember: (id, memberData) => 
    api.put(`/members/${id}`, memberData),
  
  deleteMember: (id) => 
    api.delete(`/members/${id}`),
};

// Loans API
export const loanAPI = {
  getAllLoans: (page = 1, limit = 10) => 
    api.get(`/loans?page=${page}&limit=${limit}`),
  
  getLoanById: (id) => 
    api.get(`/loans/${id}`),
  
  createLoan: (loanData) => 
    api.post('/loans', loanData),
  
  updateLoan: (id, loanData) => 
    api.put(`/loans/${id}`, loanData),
  
  deleteLoan: (id) => 
    api.delete(`/loans/${id}`),
};

// Health check
export const checkAPIHealth = () => 
  api.get('/health');

export default api;
