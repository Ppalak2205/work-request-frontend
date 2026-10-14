import React, { useState } from 'react';
import { X, Send, Calendar, MessageSquare } from 'lucide-react';

export default function NotesSection({
  isOpen,
  onClose,
  request,
  onAddNote,
  isAddingNote
}) {
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen || !request) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Note content cannot be empty.');
      return;
    }

    try {
      await onAddNote(request.id, content.trim());
      setContent('');
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to add note.');
    }
  };

  return (
    <div className="notes-drawer-backdrop" onClick={onClose}>
      <div className="notes-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="notes-header">
          <div>
            <h3 className="modal-title">Request Notes</h3>
            <p className="page-subtitle" style={{ fontSize: '0.8rem', marginTop: '0.1rem' }}>
              {request.title} &bull; {request.clientName}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close notes"
          >
            <X size={20} />
          </button>
        </div>

        <div className="notes-list">
          {(!request.notes || request.notes.length === 0) ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <MessageSquare size={36} className="empty-icon" />
              <p>No notes added yet for this request.</p>
            </div>
          ) : (
            request.notes.map((note) => (
              <div key={note.id} className="note-item">
                <div className="note-meta">
                  <span>{note.createdByUserName || 'User'}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    {formatDate(note.createdDate)}
                  </span>
                </div>
                <div className="note-content">{note.content}</div>
              </div>
            ))
          )}
        </div>

        <div className="notes-footer">
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error" style={{ marginBottom: '0.5rem' }}>{error}</div>}
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Write a note about this request..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isAddingNote || !content.trim()}
              >
                <Send size={14} />
                {isAddingNote ? 'Saving...' : 'Add Note'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
