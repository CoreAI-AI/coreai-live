import { z } from 'zod';

// Chat message validation schema
export const chatMessageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(50000, "Message is too long"),
});

// File validation
export const validateFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/pdf',
    'text/csv'
  ];

  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported');
  }

  // Validate file name
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    throw new Error('Invalid file name');
  }

  return true;
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};
