import { z } from 'zod';

// Authentication schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;

// Land registration schema
export const landRegistrationSchema = z.object({
  parcel_id: z
    .number()
    .int('Parcel ID must be a whole number')
    .positive('Parcel ID must be positive'),
  size: z
    .number()
    .positive('Land size must be positive')
    .max(1000000, 'Land size cannot exceed 1,000,000 m²'),
  ownership_type: z
    .string()
    .min(2, 'Ownership type must be at least 2 characters')
    .max(100, 'Ownership type cannot exceed 100 characters'),
  supporting_document: z
    .any()
    .optional()
    .refine(
      (file) => {
        if (!file) return true;
        if (typeof window === 'undefined') return true; // Skip validation on server
        if (!(file instanceof File)) return false;
        return file.size <= 10 * 1024 * 1024;
      },
      'File size must be less than 10MB'
    )
    .refine(
      (file) => {
        if (!file) return true;
        if (typeof window === 'undefined') return true; // Skip validation on server
        if (!(file instanceof File)) return false;
        return ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      },
      'Only JPEG, PNG, and PDF files are allowed'
    ),
});

export type LandRegistrationFormData = z.infer<typeof landRegistrationSchema>;

// Transfer schema
export const transferSchema = z.object({
  recipient_name: z
    .string()
    .min(2, 'Recipient name must be at least 2 characters')
    .max(100, 'Recipient name cannot exceed 100 characters'),
  parcel_id: z
    .string()
    .min(1, 'Parcel ID is required'),
  contract_document: z
    .any()
    .optional()
    .refine(
      (file) => {
        if (!file) return true;
        if (typeof window === 'undefined') return true; // Skip validation on server
        if (!(file instanceof File)) return false;
        return file.size <= 10 * 1024 * 1024;
      },
      'File size must be less than 10MB'
    )
    .refine(
      (file) => {
        if (!file) return true;
        if (typeof window === 'undefined') return true; // Skip validation on server
        if (!(file instanceof File)) return false;
        return ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
      },
      'Only JPEG, PNG, and PDF files are allowed'
    ),
});

export type TransferFormData = z.infer<typeof transferSchema>; 