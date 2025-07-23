import { z } from "zod";

// Auth validation schemas
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string(),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Land registration validation schema
export const landRegistrationSchema = z.object({
  parcel_id: z
    .number({
      message: "Parcel ID must be a number",
    })
    .positive("Parcel ID must be a positive number"),
  size: z
    .number({
      message: "Land size must be a number",
    })
    .positive("Land size must be a positive number")
    .max(1000000000, "Land size seems unrealistic"),
  ownership_type: z
    .string()
    .min(1, "Ownership type is required")
    .max(100, "Ownership type must be less than 100 characters"),
  supporting_document: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => {
        if (!file) return true; // Allow optional file
        return file.size <= 10 * 1024 * 1024; // 10MB limit
      },
      "File size must be less than 10MB"
    )
    .refine(
      (file) => {
        if (!file) return true; // Allow optional file
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        return allowedTypes.includes(file.type);
      },
      "Only PDF, JPEG, and PNG files are allowed"
    ),
  coordinates: z
    .array(z.array(z.number()))
    .optional()
    .refine(
      (coords) => {
        if (!coords) return true; // Allow optional coordinates
        return coords.length >= 3; // At least 3 points for a polygon
      },
      "Land boundary must have at least 3 coordinate points"
    ),
});

// Transfer validation schema
export const transferSchema = z.object({
  recipient_name: z
    .string()
    .min(1, "Recipient name is required")
    .max(100, "Recipient name must be less than 100 characters"),
  parcel_id: z.string().min(1, "Please select a parcel"),
  contract_document: z
    .instanceof(File, { message: "Please upload a contract document" })
    .optional()
    .refine(
      (file) => {
        if (!file) return true; // Allow optional file
        return file.size <= 10 * 1024 * 1024; // 10MB limit
      },
      "File size must be less than 10MB"
    )
    .refine(
      (file) => {
        if (!file) return true; // Allow optional file
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        return allowedTypes.includes(file.type);
      },
      "Only PDF, JPEG, and PNG files are allowed"
    ),
});

// Type inference
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type LandRegistrationFormData = z.infer<typeof landRegistrationSchema>;
export type TransferFormData = z.infer<typeof transferSchema>; 