import mongoose, { Schema, model, models } from 'mongoose';

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    coverImage: {
      type: String, // Cloudinary image URL
      required: true,
    },
    pdfUrl: {
      type: String, // Cloudinary secure PDF URL
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Book = models.Book || model('Book', bookSchema);

export default Book;
