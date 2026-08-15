import axios from 'axios';
import type {
  Category,
  LoginResponse,
  NominationsResponse,
  BallotResponse,
  CategoryResult,
  IdentityStats,
  SeedResult,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true, // Send httpOnly cookie on every request
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      // Let AuthContext handle the redirect
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const loginStudent = (matric_number: string) =>
  api.post<LoginResponse>('/auth/login/student', { matric_number });

export const loginAdmin = (matric_number: string, pin: string) =>
  api.post<LoginResponse>('/auth/login/admin', { matric_number, pin });

export const logout = () => api.post('/auth/logout');

export const getMe = () => api.get<{ role: string }>('/auth/me');

// ─── Categories ──────────────────────────────────────────────────────────
export const getCategories = () => api.get<Category[]>('/categories/');

export const createCategory = (data: Partial<Category>) =>
  api.post<Category>('/categories/', data);

export const updateCategory = (id: string, data: Partial<Category>) =>
  api.put<Category>(`/categories/${id}`, data);

export const deleteCategory = (id: string) => api.delete(`/categories/${id}`);

// ─── Nominations ─────────────────────────────────────────────────────────
export interface SubmitNominationPayload {
  category_id: string;
  nominee_name: string;
  reason?: string;
}

export const submitNomination = (data: SubmitNominationPayload) =>
  api.post('/nominations/', data);

export const listNominations = (category_id: string, status?: string) =>
  api.get<NominationsResponse>('/nominations/', { params: { category_id, status } });

export const updateNominationStatus = (id: string, status: string) =>
  api.put(`/nominations/${id}/status`, { status });

export interface MergePayload {
  keep_id: string;
  discard_id: string;
  final_name: string;
}

export const mergeNominations = (data: MergePayload) =>
  api.post('/nominations/merge', data);

// ─── Ballots ─────────────────────────────────────────────────────────────
export const publishBallot = (category_id: string) =>
  api.post(`/ballots/publish/${category_id}`);

export const getBallot = (category_id: string) =>
  api.get<BallotResponse>(`/ballots/${category_id}`);

// ─── Votes ───────────────────────────────────────────────────────────────
export interface SubmitVotePayload {
  category_id: string;
  ballot_entry_id: string;
}

export const submitVote = (data: SubmitVotePayload) =>
  api.post('/votes/', data);

// ─── Results ─────────────────────────────────────────────────────────────
export const getAllResults = () => api.get<CategoryResult[]>('/results/');

export const getCategoryResults = (category_id: string) =>
  api.get<CategoryResult>(`/results/${category_id}`);

export const exportResultsCsv = () =>
  api.get('/results/export/csv', { responseType: 'blob' });

// ─── Identity / Admin ────────────────────────────────────────────────────
export const seedFromCsv = (formData: FormData) =>
  api.post<SeedResult>('/identity/seed/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const seedManual = (matric_numbers: string[]) =>
  api.post<SeedResult>('/identity/seed/manual', { matric_numbers });

export const getIdentityStats = () => api.get<IdentityStats>('/identity/stats');

export default api;
