import React, { useMemo, useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Upload, PackagePlus } from 'lucide-react';
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
  const [editInventoryTiers, setEditInventoryTiers] = useState([]);
  const [manualAdjust, setManualAdjust] = useState({ tierIndex: 0, strap_size: '', delta: '' });
  const [manualAdjustSaving, setManualAdjustSaving] = useState(false);

  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [addStockSaving, setAddStockSaving] = useState(false);
  const [addStockProduct, setAddStockProduct] = useState(null);
  const [addStockForm, setAddStockForm] = useState({ strap_size: '', quantity: '', price: '' });

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
    strap_sizes: '',
    description: ''
  });
  const [stockBySize, setStockBySize] = useState({});
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

  const parseStrapSizesInput = (raw) => {
    if (!raw) return [];
    const s = String(raw).trim();
    if (!s) return [];
    return s.split(',').map(v => v.trim()).filter(Boolean);
  };

  const computedStockSum = useMemo(() => {
    const sizes = parseStrapSizesInput(newProduct.strap_sizes);
    if (sizes.length === 0) return null;
    return sizes.reduce((sum, s) => sum + (Number(stockBySize[s]) || 0), 0);
  }, [newProduct.strap_sizes, stockBySize]);

  useEffect(() => {
    // Keep stockBySize keys aligned with strap sizes input
    const sizes = parseStrapSizesInput(newProduct.strap_sizes);
    if (sizes.length === 0) {
      setStockBySize({});
      return;
    }
    setStockBySize((prev) => {
      const next = {};
      sizes.forEach((size) => {
        next[size] = prev[size] ?? '';
      });
      return next;
    });
  }, [newProduct.strap_sizes]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files.slice(0, 5));
  };

  const openAddModal = () => {
    setNewProduct({
      name: '', product_code: '', price: '', stock_quantity: '', brand: '', category: '', color: '', strap_sizes: '', description: ''
    });
    setImageFiles([]);
    setStockBySize({});
    setEditInventoryTiers([]);
    setIsEditMode(false);
    setEditId(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (product) => {
    const rawPrice = String(product.price).replace(/[^0-9.]/g, '');
    let strapSizesVal = '';
    try {
      if (product.strap_size && String(product.strap_size).trim().startsWith('[')) {
        const arr = JSON.parse(product.strap_size);
        if (Array.isArray(arr)) strapSizesVal = arr.join(', ');
      } else if (product.strap_size) {
        strapSizesVal = String(product.strap_size);
      }
    } catch (e) {
      strapSizesVal = String(product.strap_size || '');
    }
    
    setNewProduct({
      name: product.name,
      product_code: product.product_code || '',
      price: rawPrice,
      stock_quantity: product.stock_quantity,
      brand: product.brand,
      category: product.category,
      color: product.color || '',
      strap_sizes: strapSizesVal,
      description: product.description || ''
    });
    setImageFiles([]);
    setStockBySize({});
    try {
      const tiers = product?.inventory_tiers
        ? (typeof product.inventory_tiers === 'string' ? JSON.parse(product.inventory_tiers) : product.inventory_tiers)
        : [];
      setEditInventoryTiers(Array.isArray(tiers) ? tiers : []);
    } catch (e) {
      setEditInventoryTiers([]);
    }
    const sizes = parseStrapSizesFromProduct(product);
    setManualAdjust({ tierIndex: 0, strap_size: sizes[0] || '', delta: '' });
    setManualAdjustSaving(false);
    setIsEditMode(true);
    setEditId(product.id);
    setIsAddEditModalOpen(true);
  };

  const parseStrapSizesFromProduct = (product) => {
    if (!product) return [];
    const raw = product.strap_size;
    if (!raw) return [];
    const s = String(raw).trim();
    if (!s) return [];
    if (s.startsWith('[')) {
      try {
        const arr = JSON.parse(s);
        if (Array.isArray(arr)) return arr.map(String).map(v => v.trim()).filter(Boolean);
      } catch (e) {}
    }
    return s.split(',').map(v => v.trim()).filter(Boolean);
  };

  const openAddStockModal = (product) => {
    const sizes = parseStrapSizesFromProduct(product);
    setAddStockProduct(product);
    setAddStockForm({
      strap_size: sizes[0] || '',
      quantity: '',
      price: ''
    });
    setIsAddStockModalOpen(true);
  };

  const handleAddStock = () => {
    if (!addStockProduct?.id) return;
    setAddStockSaving(true);

    const payload = {
      price: addStockForm.price,
      quantity: addStockForm.quantity,
      strap_size: addStockForm.strap_size || undefined,
    };

    apiFetch(`/api/admin/products/${addStockProduct.id}/add-stock`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to add stock');
        return data;
      })
      .then(() => {
        setAddStockSaving(false);
        setIsAddStockModalOpen(false);
        setAddStockProduct(null);
        fetchProducts();
        showStatusModal({
          type: 'success',
          title: 'STOCK ADDED',
          message: 'New stock batch has been added successfully.'
        });
      })
      .catch((err) => {
        setAddStockSaving(false);
        showStatusModal({
          type: 'error',
          title: 'ADD STOCK FAILED',
          message: err.message
        });
      });
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
    const sizes = parseStrapSizesInput(newProduct.strap_sizes);
    // IMPORTANT (stock safety):
    // - Add mode: strap-size stock inputs are used to create the initial tier.
    // - Edit mode: DO NOT overwrite existing inventory_tiers unless admin explicitly enters strap-size quantities.
    const hasAnySizeStockValue = sizes.some((s) => String(stockBySize[s] ?? '').trim() !== '');
    const hasSizeStocks = sizes.length > 0 && Object.keys(stockBySize).length > 0 && hasAnySizeStockValue;
    const stockObj = {};
    let stockSum = 0;
    if (hasSizeStocks) {
      sizes.forEach((s) => {
        const q = Number(stockBySize[s]) || 0;
        stockObj[s] = q;
        stockSum += q;
      });
    }

    Object.keys(newProduct).forEach((key) => {
      if (key === 'stock_quantity' && hasSizeStocks) {
        formData.append('stock_quantity', String(stockSum));
      } else {
        formData.append(key, newProduct[key]);
      }
    });

    if (hasSizeStocks && !isEditMode) {
      // Force initial tier stock to be strap-size wise at the entered price.
      const rawPrice = String(newProduct.price || '').replace(/[^0-9.]/g, '');
      const tiers = [{ price: rawPrice, stock: stockObj }];
      formData.append('inventory_tiers', JSON.stringify(tiers));
    }
    
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

  const handleManualAdjust = async () => {
    if (!isEditMode || !editId) return;
    const deltaNum = Number(manualAdjust.delta);
    if (!manualAdjust.strap_size || !Number.isFinite(deltaNum) || deltaNum === 0) {
      showStatusModal({
        type: 'error',
        title: 'INVALID ADJUSTMENT',
        message: 'Pick a strap size and enter a non-zero adjustment amount.',
      });
      return;
    }

    setManualAdjustSaving(true);
    try {
      const res = await apiFetch(`/api/admin/products/${editId}/adjust-tier-stock`, {
        method: 'PATCH',
        body: JSON.stringify({
          tierIndex: Number(manualAdjust.tierIndex),
          strap_size: manualAdjust.strap_size,
          delta: deltaNum,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to adjust tier stock');

      // Refresh products list and also update the tier preview in the modal.
      await fetchProducts();
      const refreshed = await apiFetch('/api/admin/products').then((r) => r.json()).catch(() => null);
      if (refreshed?.products && Array.isArray(refreshed.products)) {
        const p = refreshed.products.find((x) => String(x.id) === String(editId));
        if (p) {
          try {
            const tiers = p?.inventory_tiers
              ? (typeof p.inventory_tiers === 'string' ? JSON.parse(p.inventory_tiers) : p.inventory_tiers)
              : [];
            setEditInventoryTiers(Array.isArray(tiers) ? tiers : []);
          } catch (e) {
            setEditInventoryTiers([]);
          }
          setNewProduct((prev) => ({ ...prev, stock_quantity: p.stock_quantity }));
        }
      }

      setManualAdjust((prev) => ({ ...prev, delta: '' }));
      showStatusModal({
        type: 'success',
        title: 'STOCK ADJUSTED',
        message: 'Tier stock has been updated successfully.',
      });
    } catch (e) {
      showStatusModal({
        type: 'error',
        title: 'ADJUSTMENT FAILED',
        message: e.message,
      });
    } finally {
      setManualAdjustSaving(false);
    }
  };

  const uniqueCategories = [...new Set(data.products?.map(p => p.category).filter(Boolean))];
  const uniqueBrands = [...new Set(data.products?.map(p => p.brand).filter(Boolean))];
  const addStockStrapSizes = useMemo(() => parseStrapSizesFromProduct(addStockProduct), [addStockProduct]);

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
                     <button className="action-icn" title="Add Stock" onClick={() => openAddStockModal(p)}>
                       <PackagePlus size={16}/>
                     </button>
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
          <div className="modal-content add-product-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{isEditMode ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="close-btn" onClick={() => setIsAddEditModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="form-row triplet">
                <input name="name" type="text" value={newProduct.name} placeholder="Product Name" onChange={handleInputChange} className="form-input" />
                <input name="price" type="number" value={newProduct.price} placeholder="Price (Rs)" onChange={handleInputChange} className="form-input" />
                <input
                  name="stock_quantity"
                  type="number"
                  value={computedStockSum !== null ? computedStockSum : newProduct.stock_quantity}
                  placeholder="Stock Quantity"
                  onChange={handleInputChange}
                  className="form-input"
                  readOnly={computedStockSum !== null}
                  title={computedStockSum !== null ? 'Auto-calculated from strap size stock' : undefined}
                />
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

              <div className="form-row">
                <input
                  name="strap_sizes"
                  type="text"
                  value={newProduct.strap_sizes}
                  placeholder="Strap sizes (comma separated, e.g. 20mm, 22mm)"
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              {parseStrapSizesInput(newProduct.strap_sizes).length > 0 && (
                <div className="form-row" style={{ flexDirection: 'column', gap: 10 }}>
                  <div style={{ color: '#aaa', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {isEditMode ? 'Inventory tiers (old → new)' : 'Strap size stock (initial)'}
                  </div>

                  {isEditMode ? (
                    <>
                      <div style={{ color: '#777', fontSize: 12, lineHeight: 1.6 }}>
                        Stock is sold from <span style={{ color: '#d4af37', fontWeight: 700 }}>old stock first</span>. When old stock runs out for a strap size, the website starts showing the next tier.
                        To add “new stock”, use the <span style={{ color: '#fff' }}>Add Stock</span> action (package icon) so it goes into the newest tier without mixing with old stock.
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, border: '1px solid #2a2a2a', borderRadius: 10, background: '#111' }}>
                        {editInventoryTiers.length === 0 ? (
                          <div style={{ color: '#888', fontSize: 12 }}>No tiered inventory data found for this product.</div>
                        ) : (
                          editInventoryTiers.map((t, idx) => {
                            const sizes = parseStrapSizesInput(newProduct.strap_sizes);
                            const isObj = typeof t?.stock === 'object' && t.stock !== null;
                            return (
                              <div key={idx} style={{ border: '1px solid #1f1f1f', borderRadius: 10, padding: 10, background: '#0f0f0f' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    Tier {idx + 1} {idx === 0 ? '(Old)' : '(New)'}
                                  </div>
                                  <div style={{ color: '#d4af37', fontSize: 12, fontWeight: 700 }}>
                                    Price: Rs {Number(String(t?.price ?? 0).replace(/[^0-9.]/g, '') || 0).toLocaleString()}
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                                  {sizes.map((s) => (
                                    <div key={s} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: 10, border: '1px solid #1a1a1a', borderRadius: 10, background: '#101010' }}>
                                      <div style={{ color: '#aaa', fontSize: 12, fontWeight: 700 }}>{s}</div>
                                      <div style={{ color: '#fff', fontSize: 12 }}>
                                        {isObj ? (Number(t.stock?.[s]) || 0) : (Number(t?.stock) || 0)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div style={{ marginTop: 12, padding: 12, border: '1px dashed #2a2a2a', borderRadius: 10, background: '#0e0e0e' }}>
                        <div style={{ color: '#aaa', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                          Manual correction (advanced)
                        </div>
                        <div style={{ color: '#777', fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>
                          Use this only to fix mistakes. Adjusts stock for a specific <span style={{ color: '#fff' }}>tier</span> and <span style={{ color: '#fff' }}>strap size</span>. Negative values remove stock.
                        </div>

                        <div className="form-row triplet">
                          <select
                            className="form-select"
                            value={manualAdjust.tierIndex}
                            onChange={(e) => setManualAdjust({ ...manualAdjust, tierIndex: Number(e.target.value) })}
                            disabled={manualAdjustSaving || editInventoryTiers.length === 0}
                          >
                            {editInventoryTiers.map((_, i) => (
                              <option key={i} value={i}>
                                Tier {i + 1} {i === 0 ? '(Old)' : '(New)'}
                              </option>
                            ))}
                          </select>

                          <select
                            className="form-select"
                            value={manualAdjust.strap_size}
                            onChange={(e) => setManualAdjust({ ...manualAdjust, strap_size: e.target.value })}
                            disabled={manualAdjustSaving}
                          >
                            {parseStrapSizesInput(newProduct.strap_sizes).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          <input
                            className="form-input"
                            type="number"
                            placeholder="+ / - Qty"
                            value={manualAdjust.delta}
                            onChange={(e) => setManualAdjust({ ...manualAdjust, delta: e.target.value })}
                            disabled={manualAdjustSaving}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                          <button
                            className="gold-solid-btn"
                            onClick={handleManualAdjust}
                            disabled={manualAdjustSaving || editInventoryTiers.length === 0}
                            style={{ padding: '10px 14px' }}
                          >
                            {manualAdjustSaving ? 'Applying...' : 'Apply Correction'}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                        {parseStrapSizesInput(newProduct.strap_sizes).map((s) => (
                          <div key={s} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ minWidth: 56, color: '#d4af37', fontSize: 12, fontWeight: 700 }}>{s}</div>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="0"
                              value={stockBySize[s] ?? ''}
                              onChange={(e) => setStockBySize({ ...stockBySize, [s]: e.target.value })}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ color: '#777', fontSize: 12 }}>
                        Total stock: <span style={{ color: '#d4af37', fontWeight: 700 }}>{computedStockSum ?? 0}</span>. The main “Stock Quantity” is auto-calculated from these values.
                      </div>
                    </>
                  )}
                </div>
              )}

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

      {isAddStockModalOpen && (
        <div className="modal-overlay" onClick={() => !addStockSaving && setIsAddStockModalOpen(false)}>
          <div className="modal-content add-product-modal" onClick={(e) => e.stopPropagation()} style={{ width: 560 }}>
            <div className="modal-header">
              <h3>Add Stock Batch</h3>
              <button className="close-btn" onClick={() => !addStockSaving && setIsAddStockModalOpen(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div style={{ color: '#aaa', fontSize: 13 }}>
                Product: <span style={{ color: '#fff' }}>{addStockProduct?.name || '---'}</span>
              </div>

              <div className="form-row triplet">
                {addStockStrapSizes.length > 0 ? (
                  <select
                    className="form-select"
                    value={addStockForm.strap_size}
                    onChange={(e) => setAddStockForm({ ...addStockForm, strap_size: e.target.value })}
                  >
                    {addStockStrapSizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Strap size (optional)"
                    value={addStockForm.strap_size}
                    onChange={(e) => setAddStockForm({ ...addStockForm, strap_size: e.target.value })}
                  />
                )}

                <input
                  className="form-input"
                  type="number"
                  placeholder="Quantity"
                  value={addStockForm.quantity}
                  onChange={(e) => setAddStockForm({ ...addStockForm, quantity: e.target.value })}
                />

                <input
                  className="form-input"
                  type="number"
                  placeholder="Price (Rs)"
                  value={addStockForm.price}
                  onChange={(e) => setAddStockForm({ ...addStockForm, price: e.target.value })}
                />
              </div>
              <div style={{ color: '#777', fontSize: 12 }}>
                If the price differs from the previous stock, a new FIFO price tier is created. When older tiers sell out, the website price switches automatically.
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => !addStockSaving && setIsAddStockModalOpen(false)} disabled={addStockSaving}>Close</button>
              <button className="gold-solid-btn" onClick={handleAddStock} disabled={addStockSaving}>
                {addStockSaving ? 'Adding...' : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
