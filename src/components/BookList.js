import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { bookAPI } from '../services/api';
import './BookList.css';

const BookList = ({ onAddBook, onEditBook, refreshKey }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* --------------------------------------------------------------
   *  FETCH BOOKS – re‑run when page, searchTerm OR refreshKey changes
   * ------------------------------------------------------------ */
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookAPI.getAllBooks(currentPage, 10);
        if (response.data.success) {
          setBooks(response.data.data);
          setTotalPages(response.data.pagination?.pages || 1);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [currentPage, searchTerm, refreshKey]);

  const handleDelete = async (id) => {
    try {
      await bookAPI.deleteBook(id);
      setCurrentPage(1); // This will trigger fetchBooks via useEffect
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleEdit = (book) => {
    onEditBook?.(book); // selects the book & opens the modal
  };

  const handleAdd = () => {
    onAddBook?.(); // opens the “add book” modal
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="book-list-container">
      <div className="book-header">
        <h2>Books Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FaPlus className="btn-icon" />
          Add Book
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="book-table-container">
            <table className="book-table">
              <thead>
                <tr>
                  <th>ISBN</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Copies</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book._id}>
                    <td>{book.isbn}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.copies}</td>
                    <td>
                      <span
                        className={`status ${
                          book.copies > 0 ? 'available' : 'unavailable'
                        }`}
                      >
                        {book.copies > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(book)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => {
                          setSelectedBook(book);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* ----- DELETE CONFIRMATION MODAL ----- */}
      {showDeleteModal && selectedBook && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{selectedBook.title}"?</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(selectedBook._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;
