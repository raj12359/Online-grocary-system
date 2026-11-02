import Product from '../models/Product.js';
import Offer from '../models/Offer.js';

// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category 
      ? { category: { $in: req.query.category.split(',') } } 
      : {};
    const subCategory = req.query.subCategory ? { subCategory: req.query.subCategory } : {};
    const brand = req.query.brand ? { brand: req.query.brand } : {};
    const status = req.query.status ? { status: req.query.status } : { status: 'active' };
    const isFeatured = req.query.isFeatured === 'true' ? { isFeatured: true } : {};
    
    // Check for global active offers
    const activeOffers = await Offer.find({ isActive: true, expiryDate: { $gte: new Date() } });
    
    const hasGlobalOffer = activeOffers.some(o => !o.applicableCategory);
    const offerCategoryIds = activeOffers.filter(o => o.applicableCategory).map(o => o.applicableCategory);

    // Offers filter
    let hasOffer = {};
    if (req.query.hasOffer === 'true') {
      if (!hasGlobalOffer) {
        if (offerCategoryIds.length > 0) {
          hasOffer = {
            $or: [
              { discountPercentage: { $gt: 0 } },
              { category: { $in: offerCategoryIds } }
            ]
          };
        } else {
          hasOffer = { discountPercentage: { $gt: 0 } };
        }
      }
    }

    // Price filter
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : 99999999;
    const priceFilter = { price: { $gte: minPrice, $lte: maxPrice } };

    const query = { ...keyword, ...category, ...subCategory, ...brand, ...status, ...isFeatured, ...hasOffer, ...priceFilter };

    // Sorting
    let sort = { createdAt: -1 }; // default sort
    if (req.query.sort) {
      if (req.query.sort === 'price_asc') sort = { price: 1 };
      if (req.query.sort === 'price_desc') sort = { price: -1 };
      if (req.query.sort === 'newest') sort = { createdAt: -1 };
      if (req.query.sort === 'toprated') sort = { rating: -1 };
    }

    const count = await Product.countDocuments(query);
    let products = await Product.find(query)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .lean();

    // Apply offer discount if it's better than the product's individual discount
    if (activeOffers.length > 0) {
      products = products.map(product => {
        const productDiscount = product.discountPercentage || 0;
        
        const applicableOffers = activeOffers.filter(o => 
          !o.applicableCategory || 
          o.applicableCategory.toString() === (product.category._id || product.category).toString()
        );
        const maxApplicableDiscount = applicableOffers.reduce((max, offer) => Math.max(max, offer.discountPercentage), 0);

        if (maxApplicableDiscount > productDiscount) {
          const discountAmount = (product.price * maxApplicableDiscount) / 100;
          product.discountPrice = product.price - discountAmount;
          product.discountPercentage = maxApplicableDiscount;
        }
        return product;
      });
    }

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name').populate('subCategory', 'name').lean();
    if (product) {
      const activeOffers = await Offer.find({ isActive: true, expiryDate: { $gte: new Date() } });
      
      const applicableOffers = activeOffers.filter(o => 
        !o.applicableCategory || 
        o.applicableCategory.toString() === (product.category._id || product.category).toString()
      );
      const maxApplicableDiscount = applicableOffers.reduce((max, offer) => Math.max(max, offer.discountPercentage), 0);
      
      const productDiscount = product.discountPercentage || 0;
      if (maxApplicableDiscount > productDiscount) {
        const discountAmount = (product.price * maxApplicableDiscount) / 100;
        product.discountPrice = product.price - discountAmount;
        product.discountPercentage = maxApplicableDiscount;
      }
      
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, sku, description, price, category, subCategory, brand, unit, stock, discountPrice, status, isFeatured } = req.body;
    let images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push({
          url: `http://localhost:5000/uploads/${file.filename}`,
          public_id: file.filename, // Store filename as public_id for easy deletion
        });
      }
    }

    const discountPercentage = discountPrice && price ? Math.round(((price - discountPrice) / price) * 100) : 0;

    const product = new Product({
      name,
      sku: sku ? sku : undefined,
      price,
      description,
      category,
      subCategory: subCategory ? subCategory : undefined,
      brand,
      unit: unit || 'each',
      stock,
      images,
      discountPrice,
      discountPercentage,
      status: status || 'active',
      isFeatured: isFeatured === 'true' || isFeatured === true,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, sku, description, price, category, subCategory, brand, unit, stock, discountPrice, status, isFeatured } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      if (sku) {
        product.sku = sku;
      } else if (sku === '') {
        product.sku = undefined;
      }
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      if (subCategory !== undefined) product.subCategory = subCategory ? subCategory : undefined;
      product.brand = brand || product.brand;
      product.unit = unit || product.unit;
      product.stock = stock !== undefined ? stock : product.stock;
      product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
      product.status = status || product.status;
      if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
      
      product.discountPercentage = product.discountPrice && product.price 
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
        : 0;

      if (req.files && req.files.length > 0) {
        // We'll skip local deletion for now or could use fs.unlink, but let's just push new
        let images = [];
        for (const file of req.files) {
          images.push({
            url: `http://localhost:5000/uploads/${file.filename}`,
            public_id: file.filename,
          });
        }
        product.images = images;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Skip local deletion for simplicity in this fallback mode
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
