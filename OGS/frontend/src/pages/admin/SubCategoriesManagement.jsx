import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiLayers, FiFolder } from 'react-icons/fi';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SubCategoriesManagement = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { user } = useSelector((state) => state.auth);

  const fetchData = async () => {
    try {
      setLoading(true);
      let subCatUrl = 'http://localhost:5000/api/subcategories';
      const params = [];
      if (selectedCategory) params.push(`category=${selectedCategory}`);
      if (keyword) params.push(`keyword=${keyword}`);
      if (params.length > 0) subCatUrl += `?${params.join('&')}`;

      const [subCatRes, catRes] = await Promise.all([
        axios.get(subCatUrl),
        axios.get('http://localhost:5000/api/categories'),
      ]);

      setSubCategories(subCatRes.data || []);
      setCategories(catRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load sub-categories');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, keyword]);

  const handleOpenAddModal = (defaultCategoryId = '') => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: defaultCategoryId || selectedCategory || (categories[0]?._id || ''),
      description: '',
    });
    setImageFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (subCat) => {
    setIsEditMode(true);
    setEditingId(subCat._id);
    setFormData({
      name: subCat.name,
      category: subCat.category?._id || subCat.category,
      description: subCat.description || '',
    });
    setImageFile(null);
    setPreviewUrl(subCat.image?.url || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ name: '', category: '', description: '' });
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Sub-category name is required');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a parent category');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('category', formData.category);
    payload.append('description', formData.description.trim());
    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      setSubmitting(true);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/subcategories/${editingId}`, payload, config);
        toast.success('Sub-category updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/subcategories', payload, config);
        toast.success('Sub-category created successfully!');
      }

      setSubmitting(false);
      handleCloseModal();
      fetchData();
    } catch (error) {
      setSubmitting(false);
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save sub-category');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the sub-category "${name}"?`)) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        await axios.delete(`http://localhost:5000/api/subcategories/${id}`, config);
        toast.success('Sub-category deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete sub-category');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/admin" className="hover:text-primary">Dashboard</Link>
            <span>/</span>
            <Link to="/admin/categories" className="hover:text-primary">Categories</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Sub Categories</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiLayers className="text-primary" /> Sub Categories Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Organize products into sub-categories under main categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/categories"
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            <FiFolder /> View Main Categories
          </Link>
          <button
            onClick={() => handleOpenAddModal()}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-sm text-sm font-medium"
          >
            <FiPlus /> Add Sub Category
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search sub-categories..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-60 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {(keyword || selectedCategory) && (
            <button
              onClick={() => {
                setKeyword('');
                setSelectedCategory('');
              }}
              className="text-xs text-primary hover:underline whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Sub Categories Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading sub-categories...</div>
        ) : subCategories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
              <FiLayers />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No Sub Categories Found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
              {keyword || selectedCategory
                ? 'Try adjusting your search or category filter.'
                : 'Get started by creating your first sub-category to organize grocery products.'}
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="bg-primary text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-emerald-600 transition-colors text-sm font-medium"
            >
              <FiPlus /> Add Sub Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Image</th>
                  <th className="p-4">Sub Category Name</th>
                  <th className="p-4">Parent Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {subCategories.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      {sub.image?.url ? (
                        <img
                          src={sub.image.url}
                          alt={sub.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center text-xs font-medium">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-gray-800">
                      {sub.name}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <FiFolder className="text-emerald-500 text-xs" />
                        {sub.category?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">
                      {sub.description || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          title="Edit Sub Category"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id, sub.name)}
                          title="Delete Sub Category"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Sub Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FiLayers className="text-primary" />
                {isEditMode ? 'Edit Sub Category' : 'Add New Sub Category'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-medium"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary bg-white"
                >
                  <option value="">Select a Parent Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No categories available. Please create a parent category first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exotic Fruits, Whole Milk, Leafy Greens"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-xs text-gray-400">(Optional)</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Brief description for this sub-category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Category Image <span className="text-xs text-gray-400">({isEditMode ? 'Leave blank to keep existing' : 'Optional'})</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {previewUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                    />
                    <span className="text-xs text-gray-500">Image Preview</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : isEditMode ? 'Update Sub Category' : 'Save Sub Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoriesManagement;
