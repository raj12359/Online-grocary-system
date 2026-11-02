import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import subCategoryRoutes from './routes/subCategory.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import offerRoutes from './routes/offer.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('FreshMart API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
