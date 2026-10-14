import React from 'react';
import { Search, X } from 'lucide-react';
import CustomSelect from './CustomSelect';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'New', label: 'New', dotColor: 'var(--info)' },
  { value: 'InProgress', label: 'In Progress', dotColor: 'var(--warning)' },
  { value: 'Blocked', label: 'Blocked', dotColor: 'var(--danger)' },
  { value: 'Completed', label: 'Completed', dotColor: 'var(--success)' },
];

export default function StatusFilter({
  status,
  onStatusChange,
  searchTerm,
  onSearchChange,
  onClearSearch
}) {
  return (
    <div className="filter-bar">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by title or client name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="modal-close-btn"
            style={{ position: 'absolute', right: '0.75rem' }}
            onClick={onClearSearch}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="filter-group" style={{ minWidth: '175px' }}>
        <label htmlFor="status-select" className="filter-label">Status:</label>
        <CustomSelect
          id="status-select"
          value={status}
          onChange={onStatusChange}
          options={STATUS_FILTER_OPTIONS}
          placeholder="All Statuses"
        />
      </div>
    </div>
  );
}
