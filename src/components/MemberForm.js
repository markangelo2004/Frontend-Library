import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { memberAPI } from '../services/api';
import { validateMember, isFormValid } from '../utils/validation';

const MemberForm = ({ member = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
      });
    }
  }, [member]);

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
    
    const validationErrors = validateMember(formData);
    setErrors(validationErrors);
    
    if (!isFormValid(validationErrors)) {
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      if (member) {
        // Update existing member
        await memberAPI.updateMember(member._id, formData);
        onSuccess?.('Member updated successfully!');
      } else {
        // Create new member
        await memberAPI.createMember(formData);
        onSuccess?.('Member created successfully!');
      }
      
      onClose?.();
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Email')) {
        setErrors({ email: err.response.data.message });
      } else {
        setErrorMessage(err.response?.data?.message || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-form-container">
      <div className="form-header">
        <h2>{member ? 'Edit Member' : 'Add New Member'}</h2>
        <button className="btn btn-icon" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className={errors.name ? 'input-error' : ''}
            minLength={2}
          />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <div className="error-text">{errors.email}</div>}
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
                {member ? 'Update Member' : 'Add Member'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
