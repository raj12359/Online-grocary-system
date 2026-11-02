import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      default: 0,
    },
    discountPrice: {
      type: Number,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    brand: {
      type: String,
      required: [true, 'Please add a brand'],
    },
    unit: {
      type: String,
      required: [true, 'Please specify the unit (e.g. kg, g, each, L)'],
      default: 'each',
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock count'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
