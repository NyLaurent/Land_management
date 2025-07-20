import { z } from 'zod';

// Land Registration Form Schema
export const landRegistrationSchema = z.object({
  parcel_id: z.number()
    .min(1, 'Parcel ID must be a positive number')
    .max(999999, 'Parcel ID must be less than 999999'),
  
  size: z.number()
    .min(1, 'Land size must be greater than 0')
    .max(100000, 'Land size must be reasonable'),
  
  ownership_type: z.string()
    .min(1, 'Ownership type is required')
    .max(100, 'Ownership type must be less than 100 characters'),
  
  supporting_document: z.instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024, // 10MB
      'File size must be less than 10MB'
    )
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      'File must be a JPEG, PNG, or PDF'
    ),
});

// Transfer Form Schema
export const transferSchema = z.object({
  recipient_name: z.string()
    .min(2, 'Recipient name must be at least 2 characters')
    .max(100, 'Recipient name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
  
  parcel_id: z.string()
    .min(1, 'Parcel ID is required')
    .max(20, 'Parcel ID must be less than 20 characters'),
  
  contract_document: z.instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024, // 10MB
      'File size must be less than 10MB'
    )
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      'File must be a JPEG, PNG, or PDF'
    ),
});

// Form data types inferred from schemas
export type LandRegistrationFormData = z.infer<typeof landRegistrationSchema>;
export type TransferFormData = z.infer<typeof transferSchema>; 