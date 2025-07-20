// Database entity types based on Supabase schema
export interface Land {
  id: number;
  created_at?: string;
  parcel_id: number;
  size: number;
  ownership_type: string;
  supporting_document: string; // URL to uploaded file
  statusa: 'pending' | 'under_review' | 'approved' | 'rejected';
}

export interface Transfer {
  id: number;
  created_at?: string;
  recipient_name: string;
  contract_document: string; // URL to uploaded file
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  parcel_id: string;
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