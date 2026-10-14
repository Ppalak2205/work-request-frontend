import React, { useState } from 'react';
import { X } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low', dotColor: '#94a3b8' },
  { value: 'Medium', label: 'Medium', dotColor: 'var(--warning)' },
  { value: 'High', label: 'High', dotColor: 'var(--danger)' },
];

const STATUS_OPTIONS = [
  { value: 'New', label: 'New', dotColor: 'var(--info)' },
  { value: 'InProgress', label: 'In Progress', dotColor: 'var(--warning)' },
  { value: 'Blocked', label: 'Blocked', dotColor: 'var(--danger)' },
  { value: 'Completed', label: 'Completed', dotColor: 'var(--success)' },
];

export default function WorkRequestForm({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    description: '',
    priority: 'Medium',
    status: 'New',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required.';
    } else if (formData.title.length > 200) {
      errs.title = 'Title cannot exceed 200 characters.';
    }

    if (!formData.clientName.trim()) {
      errs.clientName = 'Client name is required.';
    } else if (formData.clientName.length > 150) {
      errs.clientName = 'Client name cannot exceed 150 characters.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required.';
    }

    if (!formData.dueDate) {
      errs.dueDate = 'Due date is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
      });
      setFormData({
        title: '',
        clientName: '',
        description: '',
        priority: 'Medium',
        status: 'New',
        dueDate: '',
      });
      setErrors({});
    } catch (err) {
      const fieldErrors = err.fieldErrors || {};
      const shownFields = ['title', 'clientName', 'description', 'priority', 'status', 'dueDate'];
      const hasHiddenError = Object.keys(fieldErrors).some((key) => !shownFields.includes(key));
      // Show the banner too when the server reports an error no field displays, so nothing fails silently.
      setErrors({
        ...fieldErrors,
        ...((Object.keys(fieldErrors).length === 0 || hasHiddenError) && {
          general: err.message || 'Failed to create work request.',
        }),
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Create Work Request</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.general && (
              <div className="error-banner" style={{ marginBottom: '1rem' }}>
                <span>{errors.general}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="title" className="form-label">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-input"
                placeholder="e.g. Upgrade payment gateway"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="clientName" className="form-label">Client Name *</label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                className="form-input"
                placeholder="e.g. Global Logistics Inc"
                value={formData.clientName}
                onChange={handleChange}
                maxLength={150}
              />
              {errors.clientName && <div className="form-error">{errors.clientName}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description *</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="form-textarea"
                placeholder="Detailed description of the work request..."
                value={formData.description}
                onChange={handleChange}
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority" className="form-label">Priority *</label>
                <CustomSelect
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, priority: val }));
                    if (errors.priority) setErrors((prev) => ({ ...prev, priority: undefined }));
                  }}
                  options={PRIORITY_OPTIONS}
                />
                {errors.priority && <div className="form-error">{errors.priority}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="status" className="form-label">Status *</label>
                <CustomSelect
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, status: val }));
                    if (errors.status) setErrors((prev) => ({ ...prev, status: undefined }));
                  }}
                  options={STATUS_OPTIONS}
                />
                {errors.status && <div className="form-error">{errors.status}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">Due Date *</label>
              <CustomDatePicker
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                placeholder="Select request due date..."
              />
              {errors.dueDate && <div className="form-error">{errors.dueDate}</div>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
