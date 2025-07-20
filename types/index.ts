// Database entity types based on Supabase schema
export interface Land {
  id: number;
  created_at?: string;
  parcel_id: number;
  size: number;
  ownership_type: string;
  supporting_document: string; // URL to uploaded file
  statusa: 'pending' | 'under_review' | 'approved' | 'rejected';
  user_id?: string; // Added for authentication
}

export interface Transfer {
  id: number;
  created_at?: string;
  recipient_name: string;
  contract_document: string; // URL to uploaded file
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  parcel_id: string;
  user_id?: string; // Added for authentication
}

// User types
export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  created_at: string;
}

// Auth form types
export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
}

export interface SignInForm {
  email: string;
  password: string;
}

// Form data types (for form submissions)
export interface LandRegistrationForm {
  parcel_id: number;
  size: number;
  ownership_type: string;
  supporting_document?: File;
}

export interface TransferForm {
  recipient_name: string;
  contract_document?: File;
  parcel_id: string;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Upload response type
export interface UploadResponse {
  url: string;
  path: string;
} 