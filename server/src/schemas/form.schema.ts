import { z } from 'zod';

const formFieldSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string().min(1, 'Label is required'),
  placeholder: z.string().optional().nullable(),
  required: z.boolean().default(false),
  validation: z.any().optional().nullable(),
  defaultValue: z.any().optional().nullable(),
  helpText: z.string().optional().nullable(),
  options: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional().nullable(),
});

const formThemeSchema = z.object({
  primaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fontFamily: z.string().optional(),
}).optional().nullable();

export const createFormSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    fields: z.array(formFieldSchema).optional().nullable(),
    theme: formThemeSchema,
  }),
});

export const updateFormSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional().nullable(),
    fields: z.array(formFieldSchema).optional().nullable(),
    theme: formThemeSchema,
    isPublished: z.boolean().optional(),
  }),
});
