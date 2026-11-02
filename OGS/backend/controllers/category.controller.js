import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    let image = {};

    if (req.file) {
      const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      image = {
        url: imageUrl,
        public_id: req.file.filename,
      };
    }

    const category = new Category({
      name,
      icon,
      image,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;
      category.icon = icon || category.icon;

      if (req.file) {
        // Delete old file
        if (category.image && category.image.public_id) {
          try {
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(process.cwd(), 'uploads', category.image.public_id);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            console.error(e);
          }
        }

        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        category.image = {
          url: imageUrl,
          public_id: req.file.filename,
        };
      }

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      if (category.image && category.image.public_id) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const filePath = path.join(process.cwd(), 'uploads', category.image.public_id);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.error(e);
        }
      }
      // Delete associated subcategories and their images
      const subCategories = await SubCategory.find({ category: category._id });
      for (const sub of subCategories) {
        if (sub.image && sub.image.public_id) {
          try {
            const fs = await import('fs');
            const path = await import('path');
            const subFilePath = path.join(process.cwd(), 'uploads', sub.image.public_id);
            if (fs.existsSync(subFilePath)) {
              fs.unlinkSync(subFilePath);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      await SubCategory.deleteMany({ category: category._id });

      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
