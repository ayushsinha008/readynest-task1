import mongoose, { Document, Schema } from 'mongoose';

export interface IFormField {
  id: string; // Unique ID for the field (for DnD and rendering)
  type: string; // e.g., 'text', 'email', 'number', 'textarea', 'dropdown', 'checkbox', 'radio', etc.
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: any;
  defaultValue?: any;
  helpText?: string;
  options?: { label: string; value: string }[]; // For dropdown, radio, checkbox
}

export interface IForm extends Document {
  title: string;
  description?: string;
  slug: string;
  fields: IFormField[];
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  views: number;
  submissions: number;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema: Schema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  validation: { type: Schema.Types.Mixed },
  defaultValue: { type: Schema.Types.Mixed },
  helpText: { type: String },
  options: [{ label: String, value: String }],
});

const FormSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true },
    fields: [FormFieldSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    submissions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IForm>('Form', FormSchema);
