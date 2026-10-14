import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, AlertCircle, Inbox, Lock, LogIn } from 'lucide-react';
import {
  fetchWorkRequests,
  fetchWorkRequestById,
  createWorkRequest,
  updateWorkRequestStatus,
  addWorkRequestNote,
} from '../api/workRequestsApi';
import StatusFilter from '../components/StatusFilter';
import WorkRequestTable from '../components/WorkRequestTable';
import WorkRequestForm from '../components/WorkRequestForm';
import NotesSection from '../components/NotesSection';

export default function WorkRequestsPage({ currentUser, onOpenAuth }) {
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadRequests = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWorkRequests({
        status: status || undefined,
        search: debouncedSearch || undefined,
        page,
        pageSize,
      });
      setItems(data.items || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      if (err.status === 401) {
        setError('Your session has expired or you are unauthorized. Please sign in again.');
      } else {
        setError(err.message || 'Failed to load work requests.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, status, debouncedSearch, page, pageSize]);

  useEffect(() => {
    if (currentUser) {
      loadRequests();
    } else {
      setItems([]);
      setTotalCount(0);
    }
  }, [currentUser, loadRequests]);

  const handleStatusFilterChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleCreateSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await createWorkRequest(formData);
      setIsCreateOpen(false);
      await loadRequests();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateWorkRequestStatus(id, newStatus);
      await loadRequests();
      if (selectedRequest && selectedRequest.id === id) {
        const updated = await fetchWorkRequestById(id);
        setSelectedRequest(updated);
      }
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handleOpenNotes = async (item) => {
    try {
      const detailed = await fetchWorkRequestById(item.id);
      setSelectedRequest(detailed);
      setIsNotesOpen(true);
    } catch (err) {
      setError(err.message || 'Failed to load request notes.');
    }
  };

  const handleAddNote = async (id, content) => {
    setIsAddingNote(true);
    try {
      await addWorkRequestNote(id, content);
      const updated = await fetchWorkRequestById(id);
      setSelectedRequest(updated);
      await loadRequests();
    } finally {
      setIsAddingNote(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="main-content">
        <div className="card" style={{ maxWidth: '520px', margin: '4rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Lock size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Authentication Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            You must be signed in to view, create, and manage client work requests. Please sign in with your Admin or Staff account to continue.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAuth}
            style={{ width: '100%', maxWidth: '240px', margin: '0 auto', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <LogIn size={18} />
            <span>Sign In to Continue</span>
          </button>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="main-content">
      <div className="header-action-row">
        <div>
          <h1 className="page-title">Work Requests</h1>
          <p className="page-subtitle">
            {currentUser?.roles?.includes('Admin')
              ? 'Admin View: Track and manage all client work requests across the organization.'
              : 'Track, submit, and manage your client work requests.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadRequests}
            disabled={loading}
            title="Refresh list"
          >
            <RefreshCw size={16} className={loading ? 'spinner' : ''} />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} />
            New Request
          </button>
        </div>
      </div>

      <StatusFilter
        status={status}
        onStatusChange={handleStatusFilterChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={handleClearSearch}
      />

      {error && (
        <div className="error-banner">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            {error}
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadRequests}
          >
            Retry
          </button>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="card loading-container">
          <div className="spinner" />
          <span>Loading work requests...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="card empty-state">
          <Inbox size={48} className="empty-icon" />
          <h3>No Work Requests Found</h3>
          <p style={{ marginTop: '0.35rem' }}>
            {searchTerm || status
              ? 'No requests match your search or filter criteria. Try clearing filters.'
              : currentUser?.roles?.includes('Admin')
              ? 'There are currently no work requests in the system. Click "New Request" to create one.'
              : 'You have not submitted any work requests yet. Click "New Request" to create one.'}
          </p>
        </div>
      ) : (
        <WorkRequestTable
          items={items}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onStatusChange={handleUpdateStatus}
          onOpenNotes={handleOpenNotes}
          currentUser={currentUser}
        />
      )}

      <WorkRequestForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
      />

      <NotesSection
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        request={selectedRequest}
        onAddNote={handleAddNote}
        isAddingNote={isAddingNote}
      />
    </div>
  );
}
