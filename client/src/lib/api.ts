import axios from 'axios';

// Dynamic API URL based on current host
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // For ngrok or external access, use relative path (proxied by Vite)
  if (window.location.hostname.includes('ngrok')) {
    return '/api';
  }

  // For localhost development, use relative path (proxied by Vite)
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log all API requests
  console.log('🌐 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    data: config.data,
    headers: config.headers
  });

  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface Session {
  id: number;
  name: string;
  description?: string;
  status?: string; // 'draft' or 'completed'
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  creatorName?: string;
  creatorEmail?: string;
  painPointsCount?: number;
  useCasesCount?: number;
}

export interface PainPoint {
  id: number;
  sessionId: number;
  category: string;
  title: string;
  description: string;
  theme?: string;
  priority?: string;
  quadrant?: string;
  createdBy: number;
  createdAt: Date;
  creatorName?: string;
  creatorEmail?: string;
}

export interface UseCase {
  id: number;
  sessionId: number;
  useCaseId: string;
  priority?: string;
  quadrant?: string;
  revenue?: number;
  savings?: number;
  timeline?: string;

  // ADD THESE 6 FIELDS:
  name?: string;
  category?: string;
  problem?: string;
  agentRole?: string;
  dataRequired?: string;
  integration?: string;


  updatedBy: number;
  updatedAt: Date;
  updaterName?: string;
}

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string, role?: string) => {
    const { data } = await api.post('/auth/register', { email, password, name, role });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data as User;
  },
};

// Sessions API
export const sessionsAPI = {
  getAll: async () => {
    const { data } = await api.get('/sessions');
    return data as Session[];
  },

  getOne: async (id: number) => {
    const { data } = await api.get(`/sessions/${id}`);
    return data as Session;
  },

  create: async (name: string, description?: string) => {
    const { data } = await api.post('/sessions', { name, description });
    return data as Session;
  },

  update: async (id: number, name?: string, description?: string) => {
    const { data } = await api.put(`/sessions/${id}`, { name, description });
    return data as Session;
  },

  markCompleted: async (id: number) => {
    const { data } = await api.post(`/sessions/${id}/mark-completed`);
    return data as Session;
  },

  delete: async (id: number) => {
    await api.delete(`/sessions/${id}`);
  },
};

// Pain Points API
export const painPointsAPI = {
  getBySession: async (sessionId: number) => {
    const { data } = await api.get(`/pain-points/session/${sessionId}`);
    return data as PainPoint[];
  },

  create: async (sessionId: number, category: string, title: string, description: string, theme?: string, priority?: string, quadrant?: string) => {
    const { data } = await api.post('/pain-points', { sessionId, category, title, description, theme, priority, quadrant });
    return data as PainPoint;
  },

  update: async (id: number, category?: string, title?: string, description?: string, theme?: string, priority?: string, quadrant?: string) => {
    const { data } = await api.put(`/pain-points/${id}`, { category, title, description, theme, priority, quadrant });
    return data as PainPoint;
  },

  delete: async (id: number) => {
    await api.delete(`/pain-points/${id}`);
  },
};

// Use Cases API
export const useCasesAPI = {
  getBySession: async (sessionId: number) => {
    const { data } = await api.get(`/use-cases/session/${sessionId}`);
    return data as UseCase[];
  },

  update: async (sessionId: number, useCaseId: string, updates: Partial<UseCase>) => {
    const { data } = await api.post('/use-cases', { sessionId, useCaseId, ...updates });
    return data as UseCase;
  },

  batchUpdate: async (sessionId: number, updates: Array<{ useCaseId: string } & Partial<UseCase>>) => {
    const { data } = await api.post('/use-cases/batch', { sessionId, updates });
    return data as UseCase[];
  },
};

// Export API
export const exportAPI = {
  downloadJSON: async (sessionId: number) => {
    const response = await api.get(`/export/session/${sessionId}/json`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `session-${sessionId}-export.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadCSV: async (sessionId: number) => {
    const response = await api.get(`/export/session/${sessionId}/csv`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `session-${sessionId}-export.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default api;
