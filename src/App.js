// ──────────────────────────────────────────────────────────────────────
//  App.jsx  (merged Dashboard + routing / modal handling)
// ──────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import MemberList from './components/MemberList';
import MemberForm from './components/MemberForm';
import LoanList from './components/LoanList';
import LoanForm from './components/LoanForm';
import { checkAPIHealth, bookAPI, memberAPI, loanAPI } from './services/api';
import './App.css';

/* ==============================================================
   Dashboard – fetches stats and provides quick‑action callbacks
   ============================================================== */
const Dashboard = ({ onAddBook, onAddMember, onAddLoan }) => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    overdueLoans: 0,
  });
  const [healthStatus, setHealthStatus] = useState('checking...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    checkAPIStatus();
  }, []);

  /* ---------- fetch counts & loan stats ---------- */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [booksRes, membersRes, loansRes] = await Promise.all([
        bookAPI.getAllBooks(1, 1),          // only need total count
        memberAPI.getAllMembers(1, 1),
        loanAPI.getAllLoans(1, 1000)       // get all loans for stats
      ]);

      const booksCount = booksRes.data.pagination?.total || booksRes.data.data?.length || 0;
      const membersCount = membersRes.data.pagination?.total || membersRes.data.data?.length || 0;

      const allLoans = loansRes.data.data || [];
      const activeLoans = allLoans.filter(l => !l.returnedAt).length;
      const overdueLoans = allLoans.filter(l => {
        if (l.returnedAt) return false;
        const due = new Date(l.dueAt);
        return due < new Date();
      }).length;

      setStats({
        totalBooks: booksCount,
        totalMembers: membersCount,
        activeLoans,
        overdueLoans,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      // keep zeros on error
    } finally {
      setLoading(false);
    }
  };

  /* ---------- health check ---------- */
  const checkAPIStatus = async () => {
    try {
      const response = await checkAPIHealth();
      if (response.data.success) setHealthStatus('healthy');
    } catch (_) {
      setHealthStatus('unavailable');
    }
  };

  /* ---------- quick‑action handlers ---------- */
  const handleAddBook = () => {
    if (onAddBook) onAddBook();
    else navigate('/books');
  };

  const handleAddMember = () => {
    if (onAddMember) onAddMember();
    else navigate('/members');
  };

  const handleCreateLoan = () => {
    if (onAddLoan) onAddLoan();
    else navigate('/loans');
  };

  const handleViewReports = () => {
    // For now we just go to the loans page (you can add a dedicated report page later)
    navigate('/loans');
  };

  return (
    <div className="dashboard">
      <h1>Library Dashboard</h1>

      {loading ? (
        <div className="loading-dashboard">
          <div className="loading-spinner" />
          <p>Loading dashboard data…</p>
        </div>
      ) : (
        <>
          {/* ---------- STATISTICS ---------- */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"></div>
              <h3>Total Books</h3>
              <p className="stat-number">{stats.totalBooks}</p>
              <p className="stat-desc">Books in library</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon"></div>
              <h3>Total Members</h3>
              <p className="stat-number">{stats.totalMembers}</p>
              <p className="stat-desc">Registered members</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon"></div>
              <h3>Active Loans</h3>
              <p className="stat-number">{stats.activeLoans}</p>
              <p className="stat-desc">Books currently loaned</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon"></div>
              <h3>Overdue Loans</h3>
              <p className="stat-number">{stats.overdueLoans}</p>
              <p className="stat-desc">Past‑due loans</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon"></div>
              <h3>API Status</h3>
              <p
                className={`stat-number ${
                  healthStatus === 'healthy' ? 'status-healthy' : 'status-unhealthy'
                }`}
              >
                {healthStatus === 'healthy' ? '✅ Healthy' : '❌ Unavailable'}
              </p>
              <p className="stat-desc">Backend connection</p>
            </div>
          </div>

          {/* ---------- QUICK ACTIONS ---------- */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleAddBook}>
                <span className="btn-icon">➕</span> Add New Book
              </button>
              <button className="btn btn-secondary" onClick={handleAddMember}>
                <span className="btn-icon">👤</span> Register Member
              </button>
              <button className="btn btn-success" onClick={handleCreateLoan}>
                <span className="btn-icon">📝</span> Create Loan
              </button>
              <button className="btn btn-info" onClick={handleViewReports}>
                <span className="btn-icon">📊</span> View Reports
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ==============================================================
   Main App component – routing, modals, refresh handling
   ============================================================== */
function App() {
  // ---------- modal visibility ----------
  const [showBookForm, setShowBookForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);

  // ---------- selected items for EDIT ----------
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // ---------- refresh keys (force list re‑fetch) ----------
  const [bookRefreshKey, setBookRefreshKey] = useState(0);
  const [memberRefreshKey, setMemberRefreshKey] = useState(0);
  const [loanRefreshKey, setLoanRefreshKey] = useState(0);

  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            {/* ------------------- DASHBOARD ------------------- */}
            <Route
              path="/"
              element={
                <Dashboard
                  onAddBook={() => setShowBookForm(true)}
                  onAddMember={() => setShowMemberForm(true)}
                  onAddLoan={() => setShowLoanForm(true)}
                />
              }
            />

            {/* ------------------- BOOKS ------------------- */}
            <Route
              path="/books"
              element={
                <>
                  <BookList
                    onAddBook={() => setShowBookForm(true)}
                    onEditBook={(book) => {
                      setSelectedBook(book);
                      setShowBookForm(true);
                    }}
                    refreshKey={bookRefreshKey}
                  />
                  {showBookForm && (
                    <div className="modal-overlay">
                      <div className="modal">
                        <BookForm
                          book={selectedBook}
                          onClose={() => {
                            setShowBookForm(false);
                            setSelectedBook(null);
                          }}
                          onSuccess={() => {
                            setShowBookForm(false);
                            setSelectedBook(null);
                            setBookRefreshKey((k) => k + 1);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              }
            />

            {/* ------------------- MEMBERS ------------------- */}
            <Route
              path="/members"
              element={
                <>
                  <MemberList
                    onAddMember={() => setShowMemberForm(true)}
                    onEditMember={(member) => {
                      setSelectedMember(member);
                      setShowMemberForm(true);
                    }}
                    refreshKey={memberRefreshKey}
                  />
                  {showMemberForm && (
                    <div className="modal-overlay">
                      <div className="modal">
                        <MemberForm
                          member={selectedMember}
                          onClose={() => {
                            setShowMemberForm(false);
                            setSelectedMember(null);
                          }}
                          onSuccess={() => {
                            setShowMemberForm(false);
                            setSelectedMember(null);
                            setMemberRefreshKey((k) => k + 1);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              }
            />

            {/* ------------------- LOANS ------------------- */}
            <Route
              path="/loans"
              element={
                <>
                  <LoanList
                    onAddLoan={() => setShowLoanForm(true)}
                    onEditLoan={(loan) => {
                      setSelectedLoan(loan);
                      setShowLoanForm(true);
                    }}
                    refreshKey={loanRefreshKey}
                  />
                  {showLoanForm && (
                    <div className="modal-overlay">
                      <div className="modal">
                        <LoanForm
                          loan={selectedLoan}
                          onClose={() => {
                            setShowLoanForm(false);
                            setSelectedLoan(null);
                          }}
                          onSuccess={() => {
                            setShowLoanForm(false);
                            setSelectedLoan(null);
                            setLoanRefreshKey((k) => k + 1);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
