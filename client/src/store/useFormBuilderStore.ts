import { create } from 'zustand';

export type FieldType = 'text' | 'email' | 'number' | 'password' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'file' | 'phone' | 'url' | 'rating' | 'toggle' | 'payment';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: { label: string; value: string }[];
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: string;
}

interface FormBuilderState {
  fields: FormField[];
  selectedFieldId: string | null;
  formTitle: string;
  formDescription: string;
  theme: FormTheme;
  
  addField: (field: Omit<FormField, 'id'>) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  reorderFields: (startIndex: number, endIndex: number) => void;
  setSelectedField: (id: string | null) => void;
  setFormDetails: (title: string, description: string) => void;
  setTheme: (theme: FormTheme) => void;
  setFields: (fields: FormField[]) => void;
}

export const useFormBuilderStore = create<FormBuilderState>((set) => ({
  fields: [],
  selectedFieldId: null,
  formTitle: 'Untitled Form',
  formDescription: '',
  theme: {
    primaryColor: '#4f46e5',
    backgroundColor: '#f9fafb',
    fontFamily: 'Inter',
    borderRadius: 'md',
  },

  addField: (field) => set((state) => {
    const id = `${field.type}-${Date.now()}`;
    return { fields: [...state.fields, { ...field, id }] };
  }),

  updateField: (id, updates) => set((state) => ({
    fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
  })),

  removeField: (id) => set((state) => ({
    fields: state.fields.filter((f) => f.id !== id),
    selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
  })),

  reorderFields: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.fields);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return { fields: result };
  }),

  setSelectedField: (id) => set({ selectedFieldId: id }),

  setFormDetails: (title, description) => set({ formTitle: title, formDescription: description }),

  setTheme: (theme) => set({ theme }),

  setFields: (fields) => set({ fields }),
}));
