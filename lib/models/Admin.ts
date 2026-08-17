import mongoose, { Schema, model, models } from 'mongoose';

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export interface IAdmin {
  email: string;
  password: string;
  name: string;
}

const Admin = (models.Admin as mongoose.Model<IAdmin>) || model<IAdmin>('Admin', adminSchema);

export default Admin;
