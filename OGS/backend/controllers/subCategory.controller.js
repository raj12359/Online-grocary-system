import SubCategory from '../models/SubCategory.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';

// Helper to remove local uploaded image
const removeUploadedImage = (filename) => {
  if (!filename) return;
  try {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting subcategory image file:', error);
  }
};

// @desc    Get all subcategories (optional filter by category or keyword search)
// @route   GET /api/subcategories
// @access  Public
export const getSubCategories = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.keyword) {
      filter.name = { $regex: req.query.keyword, $options: 'i' };
    }

    const subCategories = await SubCategory.find(filter)
      .populate('category', 'name icon image')
      .sort({ createdAt: -1 });

    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single subcategory by ID
// @route   GET /api/subcategories/:id
// @access  Public
export const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate('category', 'name icon image');
    if (!subCategory) {
      return res.status(404).json({ message: 'Sub-category not found' });
    }
    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a subcategory
// @route   POST /api/subcategories
// @access  Private/Admin
export const createSubCategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Sub-category name is required' });
    }

    if (!category) {
      return res.status(400).json({ message: 'Parent category is required' });
    }

    const parentCategory = await Category.findById(category);
    if (!parentCategory) {
      return res.status(404).json({ message: 'Parent category not found' });
    }

    // Check if subcategory with same name already exists in this category
    const existing = await SubCategory.findOne({
      category,
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    });

    if (existing) {
      return res.status(400).json({ message: 'A sub-category with this name already exists in this category' });
    }

    let image = {};
    if (req.file) {
      const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      image = {
        url: imageUrl,
        public_id: req.file.filename,
      };
    }

    const subCategory = new SubCategory({
      name: name.trim(),
      category,
      description: description ? description.trim() : '',
      image,
    });

    const savedSubCategory = await subCategory.save();
    const populated = await SubCategory.findById(savedSubCategory._id).populate('category', 'name icon image');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
export const updateSubCategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({ message: 'Sub-category not found' });
    }

    const targetCategory = category || subCategory.category;

    if (category && category !== subCategory.category.toString()) {
      const parentExists = await Category.findById(category);
      if (!parentExists) {
        return res.status(404).json({ message: 'Selected parent category not found' });
      }
      subCategory.category = category;
    }

    if (name) {
      const existing = await SubCategory.findOne({
        _id: { $ne: subCategory._id },
        category: targetCategory,
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
      });

      if (existing) {
        return res.status(400).json({ message: 'A sub-category with this name already exists in this category' });
      }

      subCategory.name = name.trim();
    }

    if (description !== undefined) {
      subCategory.description = description.trim();
    }

    if (req.file) {
      // Remove old local image file if present
      if (subCategory.image && subCategory.image.public_id) {
        removeUploadedImage(subCategory.image.public_id);
      }

      const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      subCategory.image = {
        url: imageUrl,
        public_id: req.file.filename,
      };
    }

    const updatedSubCategory = await subCategory.save();
    const populated = await SubCategory.findById(updatedSubCategory._id).populate('category', 'name icon image');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({ message: 'Sub-category not found' });
    }

    if (subCategory.image && subCategory.image.public_id) {
      removeUploadedImage(subCategory.image.public_id);
    }

    // Unset subCategory reference in any products pointing to this subcategory
    await Product.updateMany(
      { subCategory: subCategory._id },
      { $unset: { subCategory: 1 } }
    );

    await subCategory.deleteOne();
    res.json({ message: 'Sub-category removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
