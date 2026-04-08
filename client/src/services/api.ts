const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('crmq_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('crmq_token');
    localStorage.removeItem('crmq_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Chyba požadavku');
  return data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Typed API functions
export interface ApiRes<T> { success: boolean; data: T; error?: string; message?: string }

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiRes<{ token: string; user: any }>>('/auth/login', { email, password }),
  me: () => api.get<ApiRes<any>>('/auth/me'),
};

export const dashboardApi = {
  get: () => api.get<ApiRes<any>>('/dashboard'),
};

export const clientsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<ApiRes<any[]>>(`/clients${qs}`);
  },
  get: (id: string) => api.get<ApiRes<any>>(`/clients/${id}`),
  create: (data: any) => api.post<ApiRes<any>>('/clients', data),
  update: (id: string, data: any) => api.patch<ApiRes<any>>(`/clients/${id}`, data),
  delete: (id: string) => api.delete<ApiRes<any>>(`/clients/${id}`),
};

export const projectsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<ApiRes<any[]>>(`/projects${qs}`);
  },
  get: (id: string) => api.get<ApiRes<any>>(`/projects/${id}`),
  create: (data: any) => api.post<ApiRes<any>>('/projects', data),
  update: (id: string, data: any) => api.patch<ApiRes<any>>(`/projects/${id}`, data),
  delete: (id: string) => api.delete<ApiRes<any>>(`/projects/${id}`),
};

export const tasksApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<ApiRes<any[]>>(`/tasks${qs}`);
  },
  get: (id: string) => api.get<ApiRes<any>>(`/tasks/${id}`),
  create: (data: any) => api.post<ApiRes<any>>('/tasks', data),
  update: (id: string, data: any) => api.patch<ApiRes<any>>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete<ApiRes<any>>(`/tasks/${id}`),
};

export const invoicesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<ApiRes<any[]>>(`/invoices${qs}`);
  },
  get: (id: string) => api.get<ApiRes<any>>(`/invoices/${id}`),
  create: (data: any) => api.post<ApiRes<any>>('/invoices', data),
  update: (id: string, data: any) => api.patch<ApiRes<any>>(`/invoices/${id}`, data),
};

export const inventoryApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<ApiRes<any[]>>(`/inventory${qs}`);
  },
  get: (id: string) => api.get<ApiRes<any>>(`/inventory/${id}`),
};

export const calendarApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<ApiRes<any[]>>(`/calendar${qs}`);
  },
  create: (data: any) => api.post<ApiRes<any>>('/calendar', data),
  update: (id: string, data: any) => api.patch<ApiRes<any>>(`/calendar/${id}`, data),
  delete: (id: string) => api.delete<ApiRes<any>>(`/calendar/${id}`),
};

export const usersApi = {
  list: () => api.get<ApiRes<any[]>>('/users'),
};

export const notesApi = {
  list: (entityType: string, entityId: string) =>
    api.get<ApiRes<any[]>>(`/notes/${entityType}/${entityId}`),
  create: (data: any) => api.post<ApiRes<any>>('/notes', data),
  update: (id: string, data: any) => api.patch<ApiRes<any>>(`/notes/${id}`, data),
  delete: (id: string) => api.delete<ApiRes<any>>(`/notes/${id}`),
};

export const activityApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<ApiRes<any[]>>(`/activity${qs}`);
  },
};

export const materialsApi = {
  listByProject: (projectId: string) => api.get<ApiRes<any[]>>(`/materials/project/${projectId}`),
  create: (data: any) => api.post<ApiRes<any>>('/materials', data),
  delete: (id: string) => api.delete<ApiRes<any>>(`/materials/${id}`),
};

export const receivedInvoicesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<ApiRes<any[]>>(`/received-invoices${qs}`);
  },
  create: (data: any) => api.post<ApiRes<any>>('/received-invoices', data),
  update: (id: string, data: any) => api.patch<ApiRes<any>>(`/received-invoices/${id}`, data),
  ocr: (text: string) => api.post<ApiRes<any>>('/received-invoices/ocr', { text }),
};

export const quickNotesApi = {
  list: () => api.get<ApiRes<any[]>>('/quicknotes'),
  create: (data: any) => api.post<ApiRes<any>>('/quicknotes', data),
  update: (id: string, data: any) => api.patch<ApiRes<any>>(`/quicknotes/${id}`, data),
  delete: (id: string) => api.delete<ApiRes<any>>(`/quicknotes/${id}`),
};

export const reportsApi = {
  overview: () => api.get<ApiRes<any>>('/reports/overview'),
  exportUrl: (entity: string, format: string) => `/api/reports/export/${entity}?format=${format}`,
};
