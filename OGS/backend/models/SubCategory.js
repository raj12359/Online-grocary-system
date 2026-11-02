import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a sub-category name'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a parent category'],
    },
    image: {
      url: { type: String },
      public_id: { type: String },
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate subcategory names within the same parent category
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });

const SubCategory = mongoose.model('SubCategory', subCategorySchema);
export default SubCategory;
