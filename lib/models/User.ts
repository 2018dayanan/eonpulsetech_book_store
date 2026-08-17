import mongoose, { Schema, model, models } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
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
    profilePic: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    },
    purchasedBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export interface IUser {
  name: string;
  email: string;
  password: string;
  profilePic?: string;
  purchasedBooks?: mongoose.Types.ObjectId[];
}

const User = (models.User as mongoose.Model<IUser>) || model<IUser>('User', userSchema);

export default User;
