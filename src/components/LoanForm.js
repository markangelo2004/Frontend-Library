import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaBook, FaUser, FaCalendar } from 'react-icons/fa';
import { loanAPI, bookAPI, memberAPI } from '../services/api';
import { validateLoan, isFormValid } from '../utils/validation';

const LoanForm = ({ loan = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    bookId: '',
    loanedAt: new Date().toISOString().split('T')[0],
    dueAt: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [bookOptions, setBookOptions] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);

  useEffect(() => {
    fetchBooksAndMembers();
    
    if (loan) {
      setFormData({
        memberId: loan.memberId?._id || loan.memberId || '',
        bookId: loan.bookId?._id || loan.bookId || '',
        loanedAt: loan.loanedAt ? new Date(loan.loanedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueAt: loan.dueAt ? new Date(loan.dueAt).toISOString().split('T')[0] : '',
      });
    } else {
      // Set default due date (7 days from now)
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 7);
      setFormData(prev => ({
        ...prev,
        dueAt: defaultDue.toISOString().split('T')[0],
      }));
    }
  }, [loan]);

  const fetchBooksAndMembers = async () => {
    try {
      const [booksRes, membersRes] = await Promise.all([
        bookAPI.getAllBooks(1, 1000),
        memberAPI.getAllMembers(1, 1000)
      ]);
      
      if (booksRes.data.success) {
        const availableBooks = booksRes.data.data.filter(book => book.copies > 0);
        setBookOptions(availableBooks);
      }
      
      if (membersRes.data.success) {
        setMemberOptions(membersRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
    
    const validationErrors = validateLoan(formData);
    setErrors(validationErrors);
    
    if (!isFormValid(validationErrors)) {
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      if (loan) {
        // Update existing loan
        await loanAPI.updateLoan(loan._id, formData);
        onSuccess?.('Loan updated successfully!');
      } else {
        // Create new loan
        await loanAPI.createLoan(formData);
        onSuccess?.('Loan created successfully!');
      }
      
      onClose?.();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const getBookTitle = (bookId) => {
    const book = bookOptions.find(b => b._id === bookId);
    return book ? `${book.title} by ${book.author} (${book.copies} copies)` : 'Select a book';
  };

  const getMemberName = (memberId) => {
    const member = memberOptions.find(m => m._id === memberId);
    return member ? `${member.name} (${member.email})` : 'Select a member';
  };

  return (
    <div className="loan-form-container">
      <div className="form-header">
        <h2>{loan ? 'Update Loan' : 'Create New Loan'}</h2>
        <button className="btn btn-icon" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="memberId">
            <FaUser className="form-icon" /> Member *
          </label>
          <select
            id="memberId"
            name="memberId"
            value={formData.memberId}
            onChange={handleChange}
            className={errors.memberId ? 'input-error' : ''}
          >
            <option value="">Select a member</option>
            {memberOptions.map(member => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
          {errors.memberId && <div className="error-text">{errors.memberId}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="bookId">
            <FaBook className="form-icon" /> Book *
          </label>
          <select
            id="bookId"
            name="bookId"
            value={formData.bookId}
            onChange={handleChange}
            className={errors.bookId ? 'input-error' : ''}
          >
            <option value="">Select a book</option>
            {bookOptions.map(book => (
              <option key={book._id} value={book._id}>
                {book.title} by {book.author} ({book.copies} copies)
              </option>
            ))}
          </select>
          {errors.bookId && <div className="error-text">{errors.bookId}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="loanedAt">
              <FaCalendar className="form-icon" /> Loan Date *
            </label>
            <input
              type="date"
              id="loanedAt"
              name="loanedAt"
              value={formData.loanedAt}
              onChange={handleChange}
              className={errors.loanedAt ? 'input-error' : ''}
            />
            {errors.loanedAt && <div className="error-text">{errors.loanedAt}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="dueAt">
              <FaCalendar className="form-icon" /> Due Date *
            </label>
            <input
              type="date"
              id="dueAt"
              name="dueAt"
              value={formData.dueAt}
              onChange={handleChange}
              className={errors.dueAt ? 'input-error' : ''}
              min={formData.loanedAt}
            />
            {errors.dueAt && <div className="error-text">{errors.dueAt}</div>}
          </div>
        </div>
        
        {loan && (
          <div className="form-group">
            <label htmlFor="returnedAt">
              <FaCalendar className="form-icon" /> Return Date
            </label>
            <input
              type="date"
              id="returnedAt"
              name="returnedAt"
              value={formData.returnedAt || ''}
              onChange={handleChange}
              min={formData.loanedAt}
            />
            <small className="form-text">
              Leave empty if book is not returned yet
            </small>
          </div>
        )}
        
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        
        {bookOptions.length === 0 && (
          <div className="warning-message">
            ⚠️ No books available for loan (all copies are borrowed)
          </div>
        )}
        
        {memberOptions.length === 0 && (
          <div className="warning-message">
            ⚠️ No members registered yet
          </div>
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
            disabled={loading || bookOptions.length === 0 || memberOptions.length === 0}
          >
            {loading ? 'Processing...' : (
              <>
                <FaSave className="btn-icon" />
                {loan ? 'Update Loan' : 'Create Loan'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanForm;
