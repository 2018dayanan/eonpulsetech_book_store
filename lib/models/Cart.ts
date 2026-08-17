import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICart extends Document {
  lines: Array<{
    id: string; // unique string for the line item
    merchandiseId: string; // The book ID
    quantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema: Schema = new Schema(
  {
    lines: [
      {
        id: { type: String, required: true },
        merchandiseId: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
export default Cart;
