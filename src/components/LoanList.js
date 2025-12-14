import React, { useState, useEffect } from 'react';
import {
  FaBook,
  FaUser,
  FaCalendarAlt,
  FaExchangeAlt,
  FaCheck,
  FaTimes,
  FaPlus,
  FaEdit,
} from 'react-icons/fa';
import { loanAPI, bookAPI, memberAPI } from '../services/api';
import './LoanList.css';

const LoanList = ({ onAddLoan, onEditLoan, refreshKey }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  /* --------------------------------------------------------------
   *  FETCH LOANS ONLY (since backend already populates)
   * ------------------------------------------------------------ */
  useEffect(() => {
    fetchLoans();
  }, [currentPage, refreshKey]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const loansRes = await loanAPI.getAllLoans(currentPage, 10);

      // Debug logging to see actual API response structure
      console.log('Loans Response:', loansRes);

      // Handle loans data
      if (loansRes.data?.success) {
        setLoans(loansRes.data.data || loansRes.data.loans || loansRes.data);
        setTotalPages(loansRes.data.pagination?.pages || loansRes.data.pages || 1);
      } else {
        // If no success property, maybe data is directly in response
        setLoans(loansRes.data || []);
      }

    } catch (err) {
      console.error('Error fetching loans:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (loanId) => {
    try {
      await loanAPI.updateLoan(loanId, { returnedAt: new Date().toISOString() });
      fetchLoans();
      setShowReturnModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleAddLoan = () => onAddLoan?.();

  const handleEditLoan = (loan) => {
    onEditLoan?.(loan);
  };

  /* --------------------------------------------------------------
   *  HELPERS – Now simpler because data is already populated
   * ------------------------------------------------------------ */
  const getBookTitle = (book) => {
    // book parameter could be a populated object or just an ID string
    if (!book) return '—';
    
    // If book is an object with title property (populated)
    if (typeof book === 'object' && book.title) {
      return book.title;
    }
    
    // If book is just an ID string (shouldn't happen with your backend)
    return '—';
  };

  const getMemberName = (member) => {
    // member parameter could be a populated object or just an ID string
    if (!member) return '—';
    
    // If member is an object with name property (populated)
    if (typeof member === 'object' && member.name) {
      return member.name;
    }
    
    // If member is just an ID string (shouldn't happen with your backend)
    return '—';
  };

  const getStatusBadge = (loan) => {
    const now = new Date();
    const dueDate = new Date(loan.dueAt);
    if (loan.returnedAt) {
      return <span className="badge badge-returned">Returned</span>;
    }
    if (dueDate < now) {
      return <span className="badge badge-overdue">Overdue</span>;
    }
    return <span className="badge badge-active">Active</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="loan-list-container">
      {/* ---- HEADER ---- */}
      <div className="loan-header">
        <h2>Book Loans</h2>
        <button className="btn btn-primary" onClick={handleAddLoan}>
          <FaPlus className="btn-icon" />
          New Loan
        </button>
      </div>

      {/* ---- CONTENT ---- */}
      {loading ? (
        <div className="loading">Loading loans…</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="loan-cards">
            {loans.length === 0 ? (
              <div className="no-loans">No loans found</div>
            ) : (
              loans.map((loan) => (
                <div key={loan._id} className="loan-card">
                  {/* ---- CARD HEADER ---- */}
                  <div className="loan-card-header">
                    {getStatusBadge(loan)}
                    <span className="loan-id">
                      #{loan._id?.substring(loan._id?.length - 6) || 'N/A'}
                    </span>
                  </div>

                  {/* ---- CARD BODY ---- */}
                  <div className="loan-details">
                    {/* Book */}
                    <div className="loan-item">
                      <FaBook className="loan-icon" />
                      <div>
                        <strong>Book:</strong>
                        <p>{getBookTitle(loan.bookId)}</p>
                        {/* Show additional book info if available */}
                        {loan.bookId && typeof loan.bookId === 'object' && (
                          <small style={{ color: '#666' }}>
                            {loan.bookId.author && `by ${loan.bookId.author}`}
                            {loan.bookId.isbn && ` | ISBN: ${loan.bookId.isbn}`}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Member */}
                    <div className="loan-item">
                      <FaUser className="loan-icon" />
                      <div>
                        <strong>Member:</strong>
                        <p>{getMemberName(loan.memberId)}</p>
                        {/* Show additional member info if available */}
                        {loan.memberId && typeof loan.memberId === 'object' && (
                          <small style={{ color: '#666' }}>
                            {loan.memberId.email && `Email: ${loan.memberId.email}`}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="loan-dates">
                      <div className="loan-item">
                        <FaCalendarAlt className="loan-icon" />
                        <div>
                          <strong>Loaned:</strong>
                          <p>{formatDate(loan.loanedAt)}</p>
                        </div>
                      </div>

                      <div className="loan-item">
                        <FaCalendarAlt className="loan-icon" />
                        <div>
                          <strong>Due:</strong>
                          <p
                            className={
                              new Date(loan.dueAt) < new Date() && !loan.returnedAt
                                ? 'text-danger'
                                : ''
                            }
                          >
                            {formatDate(loan.dueAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Returned (optional) */}
                    {loan.returnedAt && (
                      <div className="loan-item">
                        <FaCheck className="loan-icon" />
                        <div>
                          <strong>Returned:</strong>
                          <p>{formatDate(loan.returnedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ---- CARD ACTIONS ---- */}
                  <div className="loan-actions">
                    {/* Edit button */}
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEditLoan(loan)}
                    >
                      <FaEdit /> Edit
                    </button>

                    {/* Return button (only when not returned) */}
                    {!loan.returnedAt && (
                      <button
                        className="btn btn-success"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setShowReturnModal(true);
                        }}
                      >
                        <FaExchangeAlt /> Return
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ---- PAGINATION ---- */}
          {loans.length > 0 && (
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
          )}
        </>
      )}

      {/* ----- RETURN CONFIRMATION MODAL ----- */}
      {showReturnModal && selectedLoan && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Return</h3>
            <p>
              Mark book "<strong>{getBookTitle(selectedLoan.bookId)}</strong>"
              as returned by "
              <strong>{getMemberName(selectedLoan.memberId)}</strong>"?
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowReturnModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleReturnBook(selectedLoan._id)}
              >
                <FaCheck /> Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanList;
