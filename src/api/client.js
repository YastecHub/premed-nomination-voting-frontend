import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true, // Send httpOnly cookie on every request
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Let AuthContext handle the redirect
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const loginStudent = (matric_number) =>
  api.post("/auth/login/student", { matric_number });

export const loginAdmin = (matric_number, pin) =>
  api.post("/auth/login/admin", { matric_number, pin });

export const logout = () => api.post("/auth/logout");

export const getMe = () => api.get("/auth/me");

// ─── Categories ──────────────────────────────────────────────────────────
export const getCategories = () => api.get("/categories/");

export const createCategory = (data) => api.post("/categories/", data);

export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);

export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ─── Nominations ─────────────────────────────────────────────────────────
export const submitNomination = (data) => api.post("/nominations/", data);

export const listNominations = (category_id, status) =>
  api.get("/nominations/", { params: { category_id, status } });

export const updateNominationStatus = (id, status) =>
  api.put(`/nominations/${id}/status`, { status });

export const mergeNominations = (data) => api.post("/nominations/merge", data);

// ─── Ballots ─────────────────────────────────────────────────────────────
export const publishBallot = (category_id) =>
  api.post(`/ballots/publish/${category_id}`);

export const getBallot = (category_id) => api.get(`/ballots/${category_id}`);

// ─── Votes ───────────────────────────────────────────────────────────────
export const submitVote = (data) => api.post("/votes/", data);

// ─── Results ─────────────────────────────────────────────────────────────
export const getAllResults = () => api.get("/results/");

export const getCategoryResults = (category_id) =>
  api.get(`/results/${category_id}`);

export const exportResultsCsv = () =>
  api.get("/results/export/csv", { responseType: "blob" });

// ─── Identity / Admin ────────────────────────────────────────────────────
export const seedFromCsv = (formData) =>
  api.post("/identity/seed/csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const seedManual = (matric_numbers) =>
  api.post("/identity/seed/manual", { matric_numbers });

export const getIdentityStats = () => api.get("/identity/stats");

export default api;
