import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    subCategory: '',
    price: '',
    discountPrice: '',
    stock: '',
    unit: 'each',
    description: '',
    brand: '',
    status: 'active',
    isFeatured: false,
  });
  const [imageFiles, setImageFiles] = useState([]);

  const { user } = useSelector((state) => state.auth);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `http://localhost:5000/api/products?pageNumber=${page}&pageSize=10`;
      if (keyword) url += `&keyword=${keyword}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      if (subCategoryFilter) url += `&subCategory=${subCategoryFilter}`;
      
      const [prodRes, catRes, subRes] = await Promise.all([
        axios.get(url),
        axios.get('http://localhost:5000/api/categories'),
        axios.get('http://localhost:5000/api/subcategories'),
      ]);
      setProducts(prodRes.data.products);
      setPages(prodRes.data.pages);
      setCategories(catRes.data);
      setSubCategories(subRes.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, keyword, categoryFilter, subCategoryFilter]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!isEditMode && imageFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('sku', newProduct.sku);
    formData.append('category', newProduct.category);
    if (newProduct.subCategory) {
      formData.append('subCategory', newProduct.subCategory);
    } else {
      formData.append('subCategory', '');
    }
    formData.append('price', newProduct.price);
    if (newProduct.discountPrice) formData.append('discountPrice', newProduct.discountPrice);
    formData.append('stock', newProduct.stock);
    formData.append('description', newProduct.description);
    formData.append('brand', newProduct.brand);
    formData.append('unit', newProduct.unit);
    formData.append('status', newProduct.status);
    formData.append('isFeatured', newProduct.isFeatured);
    
    if (imageFiles.length > 0) {
      Array.from(imageFiles).forEach(file => {
        formData.append('images', file);
      });
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      };
      
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, formData, config);
        toast.success('Product updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/products', formData, config);
        toast.success('Product added successfully!');
      }
      
      closeModal();
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setNewProduct({
      name: '',
      sku: '',
      category: '',
      subCategory: '',
      price: '',
      discountPrice: '',
      stock: '',
      unit: 'each',
      description: '',
      brand: '',
      status: 'active',
      isFeatured: false,
    });
    setImageFiles([]);
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setIsEditMode(true);
    setEditingId(product._id);
    setNewProduct({
      name: product.name,
      sku: product.sku || '',
      category: product.category?._id || product.category || '',
      subCategory: product.subCategory?._id || product.subCategory || '',
      price: product.price,
      discountPrice: product.discountPrice || '',
      stock: product.stock,
      unit: product.unit || 'each',
      description: product.description,
      brand: product.brand,
      status: product.status,
      isFeatured: product.isFeatured || false,
    });
    setImageFiles([]);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    setEditingId(null);
    setNewProduct({
      name: '',
      sku: '',
      category: '',
      subCategory: '',
      price: '',
      discountPrice: '',
      stock: '',
      unit: 'each',
      description: '',
      brand: '',
      status: 'active',
      isFeatured: false,
    });
    setImageFiles([]);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        await axios.delete(`http://localhost:5000/api/products/${id}`, config);
        toast.success('Product deleted');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const availableSubCategories = subCategories.filter(
    (sub) => (sub.category?._id || sub.category) === newProduct.category
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubCategoryFilter('');
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          {categoryFilter && (
            <select
              value={subCategoryFilter}
              onChange={(e) => setSubCategoryFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm"
            >
              <option value="">All Sub Categories</option>
              {subCategories
                .filter((sub) => (sub.category?._id || sub.category) === categoryFilter)
                .map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
            </select>
          )}
          <button 
            onClick={openAddModal}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors whitespace-nowrap text-sm font-medium shadow-sm"
          >
            <FiPlus /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500 animate-pulse">Loading products...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Image</th>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {products.length === 0 ? (
                     <tr><td colSpan="8" className="p-6 text-center text-gray-500">No products found.</td></tr>
                  ) : products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0].url} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No Img</div>
                        )}
                      </td>
                      <td className="p-4 text-gray-800 font-medium">
                        {product.name}
                        {product.isFeatured && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Featured</span>}
                      </td>
                      <td className="p-4">
                        <div className="text-gray-800 font-medium text-xs">
                          {product.category?.name || '—'}
                        </div>
                        {product.subCategory && (
                          <span className="inline-block text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-1">
                            {product.subCategory.name}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600 text-xs font-mono">{product.sku || '-'}</td>
                      <td className="p-4 text-gray-700 font-medium">
                        ₹{product.price}
                        {product.discountPrice > 0 && <span className="ml-1 text-xs line-through text-gray-400 font-normal">₹{product.discountPrice}</span>}
                      </td>
                      <td className="p-4 text-gray-600">{product.stock}</td>
                      <td className="p-4">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {product.status}
                         </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <FiEdit2 />
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="flex justify-center items-center space-x-2 p-4 border-t border-gray-100">
                {[...Array(pages).keys()].map((x) => (
                  <button
                    key={x + 1}
                    onClick={() => setPage(x + 1)}
                    className={`px-3 py-1 rounded-md text-sm ${page === x + 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {x + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[100vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none">
                &times;
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-sm" 
                    value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-sm" 
                    value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-primary focus:border-primary text-sm"
                    value={newProduct.category}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, category: e.target.value, subCategory: '' });
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Category <span className="text-xs text-gray-400">(Optional)</span>
                  </label>
                  <select
                    disabled={!newProduct.category}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-primary focus:border-primary text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    value={newProduct.subCategory}
                    onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                  >
                    <option value="">
                      {!newProduct.category ? 'Select category first' : 'Select Sub Category (None)'}
                    </option>
                    {availableSubCategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-sm" 
                    value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" required min="0" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-sm" 
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₹)</label>
                  <input type="number" min="0" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-sm" 
                    value={newProduct.discountPrice} onChange={e => setNewProduct({...newProduct, discountPrice: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input type="number" required min="0" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-sm" 
                    value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select required className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-primary focus:border-primary text-sm"
                    value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>
                    <option value="each">Piece (Each)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="L">Liter (L)</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="dozen">Dozen</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-primary focus:border-primary text-sm"
                      value={newProduct.status} onChange={e => setNewProduct({...newProduct, status: e.target.value})}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary"
                        checked={newProduct.isFeatured} onChange={e => setNewProduct({...newProduct, isFeatured: e.target.checked})} />
                      <span className="text-sm font-medium text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea required rows="3" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary text-sm" 
                    value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (Multiple allowed) {isEditMode && '(Leave blank to keep current)'}</label>
                  <input type="file" multiple required={!isEditMode} accept="image/*" onChange={e => setImageFiles(e.target.files)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-primary hover:file:bg-gray-100" />
                </div>
              </div>
              
              <div className="mt-8 pt-5 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition-colors">
                  {isEditMode ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
