import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { bookAPI } from '../services/api';
import { validateBook, isFormValid } from '../utils/validation';

const BookForm = ({ book = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    copies: 1,
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        isbn: book.isbn || '',
        title: book.title || '',
        author: book.author || '',
        copies: book.copies || 1,
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'copies' ? parseInt(value) || 0 : value,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateBook(formData);
    setErrors(validationErrors);
    
    if (!isFormValid(validationErrors)) {
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      if (book) {
        // Update existing book
        await bookAPI.updateBook(book._id, formData);
        onSuccess?.('Book updated successfully!');
      } else {
        // Create new book
        await bookAPI.createBook(formData);
        onSuccess?.('Book created successfully!');
      }
      
      onClose?.();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-form-container">
      <div className="form-header">
        <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
        <button className="btn btn-icon" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="isbn">ISBN *</label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            placeholder="Enter ISBN (e.g., 978-0140449136)"
            className={errors.isbn ? 'input-error' : ''}
          />
          {errors.isbn && <div className="error-text">{errors.isbn}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter book title"
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && <div className="error-text">{errors.title}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="author">Author *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter author name"
            className={errors.author ? 'input-error' : ''}
          />
          {errors.author && <div className="error-text">{errors.author}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="copies">Copies *</label>
          <input
            type="number"
            id="copies"
            name="copies"
            value={formData.copies}
            onChange={handleChange}
            min="0"
            className={errors.copies ? 'input-error' : ''}
          />
          {errors.copies && <div className="error-text">{errors.copies}</div>}
        </div>
        
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (
              <>
                <FaSave className="btn-icon" />
                {book ? 'Update Book' : 'Add Book'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
