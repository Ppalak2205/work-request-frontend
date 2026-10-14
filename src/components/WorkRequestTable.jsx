import React from 'react';
import { MessageSquare, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import CustomSelect from './CustomSelect';

const STATUS_OPTIONS = [
  { value: 'New', label: 'New', dotColor: 'var(--info)' },
  { value: 'InProgress', label: 'In Progress', dotColor: 'var(--warning)' },
  { value: 'Blocked', label: 'Blocked', dotColor: 'var(--danger)' },
  { value: 'Completed', label: 'Completed', dotColor: 'var(--success)' },
];

export default function WorkRequestTable({
  items,
  totalCount,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onStatusChange,
  onOpenNotes,
  currentUser
}) {
  const isAdmin = currentUser?.roles?.includes('Admin');

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'badge badge-priority-high';
      case 'medium': return 'badge badge-priority-medium';
      case 'low': return 'badge badge-priority-low';
      default: return 'badge';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'badge badge-status-new';
      case 'inprogress': return 'badge badge-status-inprogress';
      case 'blocked': return 'badge badge-status-blocked';
      case 'completed': return 'badge badge-status-completed';
      default: return 'badge';
    }
  };

  return (
    <div className="card">
      {/* Desktop / Tablet Table View */}
      <div className="table-container desktop-table-view">
        <table className="data-table">
          <colgroup>
            <col className="col-request" />
            <col className="col-client" />
            <col className="col-priority" />
            <col className="col-status" />
            <col className="col-due" />
            <col className="col-notes" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Request</th>
              <th>Client</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Notes</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="title-cell">
                  <span className="title-text">{item.title}</span>
                  <span className="desc-text">{item.description}</span>
                  {isAdmin && item.createdByUserName && (
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.3rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Created by:</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.createdByUserName}</span>
                    </span>
                  )}
                </td>
                <td>
                  <span className="client-name">{item.clientName}</span>
                </td>
                <td>
                  <span className={getPriorityBadgeClass(item.priority)}>
                    {item.priority}
                  </span>
                </td>
                <td>
                  <span className={getStatusBadgeClass(item.status)}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                    <Calendar size={14} />
                    {formatDate(item.dueDate)}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenNotes(item)}
                    title="View notes"
                  >
                    <MessageSquare size={14} />
                    <span>{item.notesCount}</span>
                  </button>
                </td>
                <td>
                  <CustomSelect
                    size="sm"
                    value={item.status}
                    onChange={(newStatus) => onStatusChange(item.id, newStatus)}
                    options={STATUS_OPTIONS}
                    ariaLabel={`Status for ${item.title}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards View */}
      <div className="mobile-card-list">
        {items.map((item) => (
          <div key={item.id} className="mobile-request-card">
            <div className="mobile-card-header">
              <div className="mobile-card-title-group">
                <span className="mobile-card-title">{item.title}</span>
                <span className="mobile-card-client">{item.clientName}</span>
              </div>
              <span className={getPriorityBadgeClass(item.priority)}>
                {item.priority}
              </span>
            </div>

            <p className="mobile-card-desc">{item.description}</p>

            {isAdmin && item.createdByUserName && (
              <div className="mobile-card-creator">
                <span>Created by:</span>
                <strong>{item.createdByUserName}</strong>
              </div>
            )}

            <div className="mobile-card-meta-row">
              <span className="mobile-card-date">
                <Calendar size={13} />
                {formatDate(item.dueDate)}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenNotes(item)}
                title="View notes"
              >
                <MessageSquare size={13} />
                <span>{item.notesCount} notes</span>
              </button>
            </div>

            <div className="mobile-card-status-row">
              <span className="mobile-status-label">Update Status:</span>
              <div className="mobile-status-select-wrap">
                <CustomSelect
                  size="sm"
                  value={item.status}
                  onChange={(newStatus) => onStatusChange(item.id, newStatus)}
                  options={STATUS_OPTIONS}
                  ariaLabel={`Status for ${item.title}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-bar">
        <span>
          Showing {items.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(page * pageSize, totalCount)} of {totalCount} requests
        </span>
        <div className="pagination-controls">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span>Page {totalPages > 0 ? page : 0} of {totalPages}</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
