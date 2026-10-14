// Relative URLs go through the Vite dev proxy (vite.config.js), so the browser never makes a cross-origin call.
const BASE_URL = '';

function getAuthHeaders() {
  const token = localStorage.getItem('auth-token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ASP.NET Core reports validation errors as { "Title": ["..."], "$.priority": ["..."] }.
// Map them to the form's field names: { title: "...", priority: "..." }.
function toFieldErrors(errors) {
  const fieldErrors = {};
  for (const [key, messages] of Object.entries(errors)) {
    const isJsonError = key.startsWith('$.');
    const name = isJsonError ? key.slice(2) : key;
    if (!name || name === 'dto') continue;
    const field = name.charAt(0).toLowerCase() + name.slice(1);
    fieldErrors[field] = isJsonError
      ? `Invalid value for ${field}.`
      : Array.isArray(messages) ? messages[0] : String(messages);
  }
  return fieldErrors;
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: `Request failed with status ${response.status}` };
    }
    const error = new Error(errorData.detail || errorData.title || 'Request failed');
    error.status = response.status;
    error.data = errorData;
    error.fieldErrors = errorData.errors ? toFieldErrors(errorData.errors) : {};
    throw error;
  }
  return response.json();
}

export async function fetchWorkRequests({ status, search, page = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search && search.trim()) params.append('search', search.trim());
  params.append('page', page);
  params.append('pageSize', pageSize);

  const response = await fetch(`${BASE_URL}/api/work-requests?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function fetchWorkRequestById(id) {
  const response = await fetch(`${BASE_URL}/api/work-requests/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createWorkRequest(data) {
  const response = await fetch(`${BASE_URL}/api/work-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateWorkRequestStatus(id, status) {
  const response = await fetch(`${BASE_URL}/api/work-requests/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

export async function addWorkRequestNote(id, content) {
  const response = await fetch(`${BASE_URL}/api/work-requests/${id}/notes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse(response);
}

export async function fetchAdminStatus() {
  const response = await fetch(`${BASE_URL}/api/auth/admin-status`);
  return handleResponse(response);
}

export async function login(email, password) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function register(email, password, fullName) {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  });
  return handleResponse(response);
}
