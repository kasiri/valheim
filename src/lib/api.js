const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kasiheim.site';

async function request(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    let message = `Error de API (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === 'string') message = body.detail;
    } catch {
      // Keep the HTTP status as the useful error when the response has no JSON body.
    }
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  getStatus: () => request('/api/status'),
  getProgress: () => request('/api/progress'),
  login: (username, password) => request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  logout: (token) => request('/api/admin/logout', { method: 'POST', token }),
  addParticipant: (token, name, type) => request('/api/admin/participants', {
    method: 'POST',
    token,
    body: JSON.stringify({ name, type })
  }),
  removeParticipant: (token, participantId) => request(`/api/admin/participants/${participantId}`, {
    method: 'DELETE',
    token
  }),
  setBossDefeated: (token, participantId, bossId, defeated) => request(
    `/api/admin/participants/${participantId}/bosses/${bossId}`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify({ defeated })
    }
  )
};
