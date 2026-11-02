import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiLayers, FiList, FiSearch, FiFolder } from 'react-icons/fi';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const CategoriesManagement = () => {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'subcategories'
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' });
  const [categoryImageFile, setCategoryImageFile] = useState(null);

  // SubCategory Modal state
  const [showSubModal, setShowSubModal] = useState(false);
  const [isSubEditMode, setIsSubEditMode] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [subForm, setSubForm] = useState({ name: '', category: '', description: '' });
  const [subImageFile, setSubImageFile] = useState(null);

  // SubCategory filters
  const [subKeyword, setSubKeyword] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');

  const { user } = useSelector((state) => state.auth);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, subRes] = await Promise.all([
        axios.get('http://localhost:5000/api/categories'),
        axios.get('http://localhost:5000/api/subcategories'),
      ]);
      setCategories(catRes.data || []);
      setSubCategories(subRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load categories');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Handlers
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', categoryForm.name.trim());
    formData.append('icon', categoryForm.icon.trim());
    if (categoryImageFile) {
      formData.append('image', categoryImageFile);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      if (isCategoryEditMode) {
        await axios.put(`http://localhost:5000/api/categories/${editingCategoryId}`, formData, config);
        toast.success('Category updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/categories', formData, config);
        toast.success('Category added successfully!');
      }

      closeCategoryModal();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"? All related sub-categories will also be removed.`)) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        await axios.delete(`http://localhost:5000/api/categories/${id}`, config);
        toast.success('Category deleted');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const openAddCategoryModal = () => {
    setIsCategoryEditMode(false);
    setEditingCategoryId(null);
    setCategoryForm({ name: '', icon: '' });
    setCategoryImageFile(null);
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setIsCategoryEditMode(true);
    setEditingCategoryId(cat._id);
    setCategoryForm({ name: cat.name, icon: cat.icon || '' });
    setCategoryImageFile(null);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setIsCategoryEditMode(false);
    setEditingCategoryId(null);
    setCategoryForm({ name: '', icon: '' });
    setCategoryImageFile(null);
  };

  // SubCategory Handlers
  const openAddSubModal = (defaultCategoryId = '') => {
    setIsSubEditMode(false);
    setEditingSubId(null);
    setSubForm({
      name: '',
      category: defaultCategoryId || categories[0]?._id || '',
      description: '',
    });
    setSubImageFile(null);
    setShowSubModal(true);
  };

  const openEditSubModal = (sub) => {
    setIsSubEditMode(true);
    setEditingSubId(sub._id);
    setSubForm({
      name: sub.name,
      category: sub.category?._id || sub.category,
      description: sub.description || '',
    });
    setSubImageFile(null);
    setShowSubModal(true);
  };

  const closeSubModal = () => {
    setShowSubModal(false);
    setIsSubEditMode(false);
    setEditingSubId(null);
    setSubForm({ name: '', category: '', description: '' });
    setSubImageFile(null);
  };

  const handleSaveSubCategory = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim()) {
      toast.error('Sub-category name is required');
      return;
    }
    if (!subForm.category) {
      toast.error('Parent category is required');
      return;
    }

    const payload = new FormData();
    payload.append('name', subForm.name.trim());
    payload.append('category', subForm.category);
    payload.append('description', subForm.description.trim());
    if (subImageFile) {
      payload.append('image', subImageFile);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      if (isSubEditMode) {
        await axios.put(`http://localhost:5000/api/subcategories/${editingSubId}`, payload, config);
        toast.success('Sub-category updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/subcategories', payload, config);
        toast.success('Sub-category added successfully!');
      }

      closeSubModal();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save sub-category');
    }
  };

  const handleDeleteSubCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete sub-category "${name}"?`)) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        await axios.delete(`http://localhost:5000/api/subcategories/${id}`, config);
        toast.success('Sub-category deleted');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete sub-category');
      }
    }
  };

  // Filtered subcategories
  const filteredSubCategories = subCategories.filter((sub) => {
    const matchesKeyword = !subKeyword || sub.name.toLowerCase().includes(subKeyword.toLowerCase());
    const matchesCategory =
      !subCategoryFilter || (sub.category?._id || sub.category) === subCategoryFilter;
    return matchesKeyword && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories & Sub Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your store's product categories and sub-categories
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => openAddSubModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
          >
            <FiLayers /> Add Sub Category
          </button>
          <button
            onClick={openAddCategoryModal}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-600 transition-colors text-sm font-medium shadow-sm"
          >
            <FiPlus /> Add Category
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'categories'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <FiList />
          <span>Categories</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 font-semibold">
            {categories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('subcategories')}
          className={`flex items-center gap-2 py-3 px-5 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'subcategories'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <FiLayers />
          <span>Sub Categories</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 font-semibold">
            {subCategories.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Categories View */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No categories created yet.</p>
              <button
                onClick={openAddCategoryModal}
                className="bg-primary text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-primary-600 text-sm font-medium"
              >
                <FiPlus /> Add First Category
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Image</th>
                    <th className="p-4">Category Name</th>
                    <th className="p-4">Icon Class</th>
                    <th className="p-4">Sub Categories</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {categories.map((cat) => {
                    const relatedSubs = subCategories.filter(
                      (s) => (s.category?._id || s.category) === cat._id
                    );
                    return (
                      <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          {cat.image && cat.image.url ? (
                            <img
                              src={cat.image.url}
                              alt={cat.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs font-medium">
                              No Img
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-gray-800">{cat.name}</td>
                        <td className="p-4 text-gray-600 font-mono text-xs">{cat.icon || '—'}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {relatedSubs.length} sub-categor{relatedSubs.length === 1 ? 'y' : 'ies'}
                            </span>
                            <button
                              onClick={() => openAddSubModal(cat._id)}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:text-emerald-700 font-medium px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
                              title={`Add Sub Category to ${cat.name}`}
                            >
                              <FiPlus className="text-xs" /> Add Sub
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditCategoryModal(cat)}
                              title="Edit Category"
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat._id, cat.name)}
                              title="Delete Category"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sub Categories View */}
      {activeTab === 'subcategories' && (
        <div className="space-y-4">
          {/* Subcategory filter bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sub-categories..."
                value={subKeyword}
                onChange={(e) => setSubKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-3">
              <select
                value={subCategoryFilter}
                onChange={(e) => setSubCategoryFilter(e.target.value)}
                className="w-full sm:w-60 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-700"
              >
                <option value="">All Parent Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {(subKeyword || subCategoryFilter) && (
                <button
                  onClick={() => {
                    setSubKeyword('');
                    setSubCategoryFilter('');
                  }}
                  className="text-xs text-primary hover:underline whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading sub-categories...</div>
            ) : filteredSubCategories.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                  <FiLayers />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">No Sub Categories Found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {subKeyword || subCategoryFilter
                    ? 'No sub-categories match your current filters.'
                    : 'Add your first sub-category to organize products under categories.'}
                </p>
                <button
                  onClick={() => openAddSubModal(subCategoryFilter)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm font-medium transition-colors"
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
                    {filteredSubCategories.map((sub) => (
                      <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          {sub.image?.url ? (
                            <img
                              src={sub.image.url}
                              alt={sub.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center text-xs">
                              No Img
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-gray-800">{sub.name}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <FiFolder className="text-xs" />
                            {sub.category?.name || 'Unassigned'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 max-w-xs truncate">
                          {sub.description || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditSubModal(sub)}
                              title="Edit Sub Category"
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteSubCategory(sub._id, sub.name)}
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
        </div>
      )}

      {/* Category Modal (Add / Edit) */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                {isCategoryEditMode ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={closeCategoryModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon Class (e.g. FiStar, FiCoffee)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Image {isCategoryEditMode && '(Leave blank to keep current)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCategoryImageFile(e.target.files[0])}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  {isCategoryEditMode ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub Category Modal (Add / Edit) */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiLayers className="text-emerald-600" />
                {isSubEditMode ? 'Edit Sub Category' : 'Add New Sub Category'}
              </h2>
              <button onClick={closeSubModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveSubCategory} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={subForm.category}
                    onChange={(e) => setSubForm({ ...subForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select Parent Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exotic Fruits, Greek Yogurt, Brown Bread"
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                    value={subForm.name}
                    onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-xs text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Short description..."
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-primary focus:border-primary"
                    value={subForm.description}
                    onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-Category Image {isSubEditMode && '(Leave blank to keep current)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSubImageFile(e.target.files[0])}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeSubModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  {isSubEditMode ? 'Update Sub Category' : 'Save Sub Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
