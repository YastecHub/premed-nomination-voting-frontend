// ─── Auth ──────────────────────────────────────────────────────────────────
export type Role = 'student' | 'admin';

export interface AuthUser {
  role: Role;
}

// ─── Categories ────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  type: 'award' | 'position';
  nomination_is_open: boolean;
  voting_is_open: boolean;
  ballot_published: boolean;
  nomination_open_at: string | null;
  nomination_close_at: string | null;
  voting_open_at: string | null;
  voting_close_at: string | null;
  nomination_force_closed: boolean;
  voting_force_closed: boolean;
}

// ─── Nominations ───────────────────────────────────────────────────────────
export interface Nomination {
  id: string;
  nominee_name: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DuplicateHint {
  nomination_a_id: string;
  nomination_b_id: string;
  name_a: string;
  name_b: string;
  similarity_score: number;
}

export interface NominationsResponse {
  nominations: Nomination[];
  duplicate_hints: DuplicateHint[];
}

// ─── Ballots / Votes ───────────────────────────────────────────────────────
export interface BallotEntry {
  id: string;
  nominee_name: string;
}

export interface BallotResponse {
  entries: BallotEntry[];
}

// ─── Results ───────────────────────────────────────────────────────────────
export interface ResultEntry {
  ballot_entry_id: string;
  nominee_name: string;
  vote_count: number;
  is_winner: boolean;
}

export interface CategoryResult {
  category_id: string;
  category_name: string;
  category_type: 'award' | 'position';
  results: ResultEntry[];
}

// ─── Identity / Seed ───────────────────────────────────────────────────────
export interface IdentityStats {
  total_eligible: number;
  total_nominated: number;
  total_voted: number;
}

export interface SeedResult {
  inserted: number;
  skipped: number;
  total: number;
}

// ─── Login response ────────────────────────────────────────────────────────
export interface LoginResponse {
  role: Role;
  message: string;
}
