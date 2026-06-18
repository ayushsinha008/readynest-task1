import mongoose, { Document, Schema } from 'mongoose';

export interface IResponse extends Document {
  formId: mongoose.Types.ObjectId;
  respondentEmail: string;
  data: Record<string, any>;
  submittedAt: Date;
}

const ResponseSchema: Schema = new Schema(
  {
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    respondentEmail: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: 'submittedAt', updatedAt: false } }
);

export default mongoose.model<IResponse>('Response', ResponseSchema);
