import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  avatar?: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  plan?: string;
  isVerified: boolean;
  otpCode?: string;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    avatar: { type: String },
    stripeCustomerId: { type: String },
    subscriptionId: { type: String },
    subscriptionStatus: { type: String, enum: ['active', 'canceled', 'past_due', 'free'], default: 'free' },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free'
    },
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
