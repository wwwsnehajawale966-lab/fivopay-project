import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fivopay-backend-2rhl.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Token expired or invalid. Redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const workspaceService = {
  getUsers: () => api.get('/workspace/users'),
  getBoards: () => api.get('/workspace/boards'),
  createBoard: (title) => api.post('/workspace/boards', { title }),
  updateBoard: (boardId, title) => api.put('/workspace/boards', { boardId, title }),
  deleteBoard: (boardId) => api.delete(`/workspace/boards/${boardId}`),
  inviteUser: (data) => api.post('/workspace/invite', data),
  getBoardData: (boardId, date) => api.get(`/workspace/board/${boardId}${date ? `?date=${date}` : ''}`),
  getBoardMembers: (boardId) => api.get(`/workspace/board/${boardId}/members`),

  createList: (data) => api.post('/workspace/list', data),
  updateList: (data) => api.put('/workspace/list', data),
  deleteList: (listId) => api.delete(`/workspace/list/${listId}`),

  createCard: (data) => api.post('/workspace/card', data),
  updateCard: (data) => api.put('/workspace/card', data),
  deleteCard: (cardId) => api.delete(`/workspace/card/${cardId}`),
  moveCard: (data) => api.put('/workspace/card/move', data),
};

export const plannerService = {
  getTasks: () => api.get('/planner/tasks'),
  createTask: (data) => api.post('/planner/tasks', data),
  updateTask: (id, data) => api.put(`/planner/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/planner/tasks/${id}`),
  saveFocusSession: (data) => api.post('/planner/focus-session', data),
  getDailyStats: () => api.get('/planner/stats/daily'),
};

export const analyticsService = {
  getDashboardAnalytics: (boardId, dateFilter = 'all') =>
    api.get(`/analytics/dashboard/${boardId}${dateFilter !== 'all' ? `?dateFilter=${dateFilter}` : ''}`),
  getBoardStats: (boardId, dateFilter = 'all') =>
    api.get(`/analytics/stats/${boardId}${dateFilter !== 'all' ? `?dateFilter=${dateFilter}` : ''}`),
  getEmployeePerformance: (boardId, dateFilter = 'all') =>
    api.get(`/analytics/performance/${boardId}${dateFilter !== 'all' ? `?dateFilter=${dateFilter}` : ''}`),
  getWeeklyProductivity: (boardId) =>
    api.get(`/analytics/weekly/${boardId}`),
  getTaskStatusDistribution: (boardId, dateFilter = 'all') =>
    api.get(`/analytics/distribution/${boardId}${dateFilter !== 'all' ? `?dateFilter=${dateFilter}` : ''}`),
};

export default api;
