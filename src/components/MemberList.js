import React, { useState, useEffect } from 'react';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaUser,
  FaEnvelope,
  FaCalendar,
} from 'react-icons/fa';
import { memberAPI } from '../services/api';
import '../App.css';

const MemberList = ({ onAddMember, onEditMember, refreshKey }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* --------------------------------------------------------------
   *  FETCH MEMBERS – re‑run when page, refreshKey changes
   * ------------------------------------------------------------ */
  useEffect(() => {
    fetchMembers();
  }, [currentPage, refreshKey]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await memberAPI.getAllMembers(currentPage, 10);
      if (response.data.success) {
        setMembers(response.data.data);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await memberAPI.deleteMember(id);
      fetchMembers();
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete member');
    }
  };

  const handleEdit = (member) => {
    onEditMember?.(member);
  };

  const handleAdd = () => {
    onAddMember?.();
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString();

  return (
    <div className="member-list-container">
      <div className="member-header">
        <h2>Library Members</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FaPlus className="btn-icon" />
          Add Member
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search members by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading members...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="member-grid">
            {filteredMembers.map((member) => (
              <div key={member._id} className="member-card">
                <div className="member-avatar">
                  <FaUser />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="member-email">
                    <FaEnvelope /> {member.email}
                  </p>
                  <p className="member-joined">
                    <FaCalendar /> Joined: {formatDate(member.joinedAt)}
                  </p>
                  <p className="member-id">
                    ID: {member._id.substring(member._id.length - 6)}
                  </p>
                </div>
                <div className="member-actions">
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEdit(member)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
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
      {showDeleteModal && selectedMember && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete member "
              <strong>{selectedMember.name}</strong>"?
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(selectedMember._id)}
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

export default MemberList;
