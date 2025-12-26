import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'customer' | 'analyst' | 'compliance_officer' | 'admin';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (candidate: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'analyst', 'compliance_officer', 'admin'], default: 'customer', index: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended', 'pending'], default: 'active' },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidate, this.password);
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  // @ts-ignore
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
