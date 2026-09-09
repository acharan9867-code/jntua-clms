const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('jntua_clms_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('jntua_clms_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('jntua_clms_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'An unexpected response was received from the server.'
  }));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed with status ' + response.status);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { identifier: string; password: string }) =>
    request<{ success: boolean; token: string; user: any; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  getProfile: () =>
    request<{ success: boolean; user: any; stats: any }>('/auth/me'),

  getDemoAccounts: () =>
    request<{ success: boolean; defaultPassword: string; accounts: any[] }>('/auth/demo-accounts'),

  // Books
  getBooks: (params: { search?: string; category?: string; availableOnly?: boolean; sortBy?: string; sortOrder?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.availableOnly) query.append('availableOnly', 'true');
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    return request<{ success: boolean; count: number; books: any[] }>(`/books?${query.toString()}`);
  },

  getBookById: (id: number) =>
    request<{ success: boolean; book: any }>(`/books/${id}`),

  getCategories: () =>
    request<{ success: boolean; categories: any[] }>('/books/categories'),

  createBook: (bookData: any) =>
    request<{ success: boolean; message: string; bookId: number }>('/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    }),

  updateBook: (id: number, bookData: any) =>
    request<{ success: boolean; message: string }>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData)
    }),

  deleteBook: (id: number) =>
    request<{ success: boolean; message: string }>(`/books/${id}`, {
      method: 'DELETE'
    }),

  // Transactions
  issueBook: (bookId: number, targetUserId?: number) =>
    request<{ success: boolean; message: string; details: any }>('/transactions/issue', {
      method: 'POST',
      body: JSON.stringify({ bookId, targetUserId })
    }),

  returnBook: (transactionId: number) =>
    request<{ success: boolean; message: string; details: any }>('/transactions/return', {
      method: 'POST',
      body: JSON.stringify({ transactionId })
    }),

  reportLostOrDamaged: (payload: { transactionId: number; statusType: 'lost' | 'damaged'; notes?: string }) =>
    request<{ success: boolean; message: string; details: any }>('/transactions/lost-damaged', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMyTransactions: () =>
    request<{ success: boolean; active: any[]; history: any[] }>('/transactions/my-transactions'),

  // Reservations
  createReservation: (bookId: number) =>
    request<{ success: boolean; message: string; reservation: any }>('/reservations', {
      method: 'POST',
      body: JSON.stringify({ bookId })
    }),

  cancelReservation: (id: number) =>
    request<{ success: boolean; message: string }>(`/reservations/${id}`, {
      method: 'DELETE'
    }),

  getMyReservations: () =>
    request<{ success: boolean; reservations: any[] }>('/reservations/my-reservations'),

  getAllReservations: () =>
    request<{ success: boolean; reservations: any[] }>('/reservations/all'),

  // Admin
  getDashboardStats: () =>
    request<{ success: boolean; stats: any }>('/admin/stats'),

  adjustFine: (payload: { transactionId: number; adjustedFine: number; waiverReason: string; totalPaid?: number }) =>
    request<{ success: boolean; message: string; audit: any }>('/admin/fines/adjust', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getAllMembers: (params: { role?: string; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    return request<{ success: boolean; count: number; members: any[] }>(`/admin/members?${query.toString()}`);
  },

  quickCounterIssue: (memberIdentifier: string, bookIdentifier: string) =>
    request<{ success: boolean; message: string; transactionId: number }>('/admin/counter-issue', {
      method: 'POST',
      body: JSON.stringify({ memberIdentifier, bookIdentifier })
    }),

  // Reports
  getOverdueReport: () =>
    request<{ success: boolean; count: number; overdueList: any[] }>('/reports/overdue'),

  getMostBorrowedReport: () =>
    request<{ success: boolean; report: any[] }>('/reports/most-borrowed'),

  getCategoryReport: () =>
    request<{ success: boolean; report: any[] }>('/reports/categories'),

  getTransactionHistory: (params: { status?: string; search?: string; startDate?: string; endDate?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    return request<{ success: boolean; count: number; history: any[] }>(`/reports/history?${query.toString()}`);
  },

  // Settings
  getSettings: () =>
    request<{ success: boolean; settings: Record<string, { value: string; description: string; updatedAt: string }> }>('/settings'),

  updateSetting: (key_name: string, value: string) =>
    request<{ success: boolean; message: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ key_name, value })
    })
};
