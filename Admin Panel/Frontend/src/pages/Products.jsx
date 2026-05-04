import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import Header from '../components/Header';

import productPlaceholder from '../assets/watchlogo.png';
import '../styles/Products.css';
import { apiFetch, getApiBaseUrl } from '../utils/api';

export default function Products() {
  const [data, setData] = useState({ products: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const { showModal: showStatusModal } = useModal();
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    product_code: '',
    price: '',
    stock_quantity: '',
    brand: '',
    category: '',
    color: '',
    description: ''
  });
  const [imageFiles, setImageFiles] = useState([]);

  const fetchProducts = () => {
    apiFetch('/api/admin/products')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files.slice(0, 5));
  };

  const openAddModal = () => {
    setNewProduct({
      name: '', product_code: '', price: '', stock_quantity: '', brand: '', category: '', color: '', description: ''
    });
    setImageFiles([]);
    setIsEditMode(false);
    setEditId(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (product) => {
    const rawPrice = String(product.price).replace(/[^0-9.]/g, '');
    
    setNewProduct({
      name: product.name,
      product_code: product.product_code || '',
      price: rawPrice,
      stock_quantity: product.stock_quantity,
      brand: product.brand,
      category: product.category,
      color: product.color || '',
      description: product.description || ''
    });
    setImageFiles([]);
    setIsEditMode(true);
    setEditId(product.id);
    setIsAddEditModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => fetchProducts())
        .catch(err => console.error('Delete error:', err));
    }
  };

  const handleSaveProduct = () => {
    setSaving(true);
    const formData = new FormData();
    Object.keys(newProduct).forEach(key => formData.append(key, newProduct[key]));
    
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    const url = isEditMode
      ? `/api/admin/products/${editId}`
      : '/api/admin/products';
    const method = isEditMode ? 'PUT' : 'POST';

    apiFetch(url, {
      method,
      body: formData
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save product');
        
        setSaving(false);
        setIsAddEditModalOpen(false);
        fetchProducts(); 
        
        showStatusModal({
          type: 'success',
          title: isEditMode ? 'PRODUCT UPDATED' : 'PRODUCT ADDED',
          message: isEditMode ? 'Product details have been updated successfully.' : 'New product has been added to the catalog.'
        });
      })
      .catch(err => {
        console.error('Save error:', err);
        setSaving(false);
        showStatusModal({
          type: 'error',
          title: 'SAVE FAILED',
          message: err.message
        });
      });
  };

  const uniqueCategories = [...new Set(data.products?.map(p => p.category).filter(Boolean))];
  const uniqueBrands = [...new Set(data.products?.map(p => p.brand).filter(Boolean))];

  const filteredProducts = data.products?.filter(p => {
    const matchCategory = filterCategory === '' || p.category === filterCategory;
    const matchBrand = filterBrand === '' || p.brand === filterBrand;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (p.product_code && p.product_code.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchBrand && matchSearch;
  });

  if (loading) return <div className="loading">Loading Products...</div>;

  return (
    <div className="products-page">
      <Header 
        title="Product Management" 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        searchPlaceholder="Search your item here"
      />

      <div className="products-stats-row">
        <div className="prod-stat-card outline-gold">
          <p>Total Products</p>
          <h2>{data.stats?.totalProducts || 0}</h2>
        </div>
        <div className="prod-stat-card outline-gold">
          <p>In Stock</p>
          <h2>{data.stats?.inStockCount || 0}</h2>
        </div>
        <div className="prod-stat-card outline-gold">
          <p>Out of Stock</p>
          <h2 className="red-text">{data.stats?.outOfStockCount || 0}</h2>
        </div>
        <div className="prod-stat-card outline-gold">
          <p>Categories</p>
          <h2>{data.stats?.categoriesCount || 0}</h2>
        </div>
      </div>

      <div className="products-table-container">
        <div className="table-filters">
          <div className="search-bar table-search">
            <Search size={16} />
            <input type="text" placeholder="Search your item here" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select className="filter-select" value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
            <option value="">All Brands</option>
            {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
          </select>
          <button className="gold-solid-btn" onClick={openAddModal}>
            <Plus size={16}/> Add Product
          </button>
        </div>

        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Code</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts?.map(p => (
              <tr key={p.id}>
                <td>
                  <img 
                    src={p.image_url ? `${getApiBaseUrl()}${p.image_url}` : productPlaceholder} 
                    alt={p.name} 
                    className="product-img-thumb" 
                  />
                </td>
                <td className="id-col">{p.product_code || "---"}</td>
                <td className="prod-name-col">{p.name}</td>
                <td className="brand-col">{p.brand}</td>
                <td><span className="cat-badge">{p.category}</span></td>
                <td>{typeof p.price === 'string' && p.price.includes('Rs') ? p.price : `Rs ${Number(String(p.price).replace(/[^0-9.]/g, '') || 0).toLocaleString()}`}</td>
                <td>
                   <span className={p.stock_quantity > 0 ? "stock-badge green" : "stock-badge red"}>
                     {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : "Out of stock"}
                   </span>
                </td>
                <td>
                   <div className="actions-cell">
                     <button className="action-icn" onClick={() => openEditModal(p)}>
                       <Edit2 size={16}/>
                     </button>
                     <button className="action-icn" onClick={() => handleDelete(p.id)}>
                       <Trash2 size={16}/>
                     </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAddEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content add-product-modal">
            <div className="modal-header">
              <h3>{isEditMode ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="close-btn" onClick={() => setIsAddEditModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="form-row triplet">
                <input name="name" type="text" value={newProduct.name} placeholder="Product Name" onChange={handleInputChange} className="form-input" />
                <input name="price" type="number" value={newProduct.price} placeholder="Price (Rs)" onChange={handleInputChange} className="form-input" />
                <input name="stock_quantity" type="number" value={newProduct.stock_quantity} placeholder="Stock Quantity" onChange={handleInputChange} className="form-input" />
              </div>
              
              <div className="form-row doublet">
                <select name="brand" value={newProduct.brand} onChange={handleInputChange} className="form-select">
                   <option value="">Brand</option>
                   <option value="Rolex">Rolex</option>
                   <option value="Omega">Omega</option>
                   <option value="Tissot">Tissot</option>
                   <option value="Audemars Piguet">Audemars Piguet</option>
                   <option value="Tag Heuer">Tag Heuer</option>
                   <option value="Cartier">Cartier</option>
                   <option value="Patek Philippe">Patek Philippe</option>
                </select>
                <select name="category" value={newProduct.category} onChange={handleInputChange} className="form-select">
                   <option value="">Category</option>
                   <option value="Luxury">Luxury</option>
                   <option value="Sport">Sport</option>
                   <option value="Analog">Analog</option>
                   <option value="Smart">Smart</option>
                </select>
              </div>

              <div className="form-row selectors-row">
                <div className="color-selector">
                   <label>Color :</label>
                   <div className="color-options">
                     {['#ccc', '#eab308', '#000', '#2563eb', '#fff'].map(c => (
                        <div 
                          key={c} 
                          className={`color-circle ${newProduct.color === c ? 'selected' : ''}`}
                          style={{ background: c }}
                          onClick={() => setNewProduct({ ...newProduct, color: c })}
                        />
                     ))}
                   </div>
                </div>
              </div>

              <div className="form-row split-content">
                <div className="desc-section">
                  <label>Description</label>
                  <textarea 
                    name="description" 
                    value={newProduct.description}
                    placeholder="Enter product description..." 
                    onChange={handleInputChange}
                    className="form-textarea"
                  />
                </div>
                <div className="image-section">
                  <label>Product Images (Up to 5)</label>
                  <div className="upload-box" onClick={() => document.getElementById('image-upload').click()}>
                    <Upload size={30} color="#888" />
                    <p>{isEditMode ? 'Add/Replace images' : 'Drop up to 5 images here or click to upload'}</p>
                    <span>High resolution PNG or JPG</span>
                    <input id="image-upload" type="file" multiple onChange={handleFileChange} style={{display: 'none'}} />
                    <div className="selected-images-preview">
                       {imageFiles.map((f, i) => (
                         <span key={i} className="file-name">{f.name}</span>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
               <button className="cancel-btn" onClick={() => setIsAddEditModalOpen(false)}>Close</button>
               <button className="gold-solid-btn" onClick={handleSaveProduct} disabled={saving}>
                 {saving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Product')}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
