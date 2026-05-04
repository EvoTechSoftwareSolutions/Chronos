import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useModal } from '../context/ModalContext';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import '../styles/Customers.css';
import { apiFetch } from '../utils/api';

export default function Customers() {
  const [data, setData] = useState({ customers: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const { showModal: showStatusModal } = useModal();
  
  // Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    orders_count: 0,
    total_spent: 0,
    join_date: new Date().toISOString().split('T')[0],
    status: 'New'
  });

  const fetchCustomers = () => {
    apiFetch('/api/admin/customers')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setNewCustomer({
      name: '',
      email: '',
      orders_count: 0,
      total_spent: 0,
      join_date: new Date().toISOString().split('T')[0],
      status: 'New'
    });
    setIsEditMode(false);
    setEditId(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (customer) => {
    let formattedDate = '';
    try {
      const d = new Date(customer.join_date);
      formattedDate = d.toISOString().split('T')[0];
    } catch {
      formattedDate = new Date().toISOString().split('T')[0];
    }

    const rawSpent = customer.total_spent ? String(customer.total_spent).replace(/[^0-9.]/g, '') : '0';

    setNewCustomer({
      name: customer.name,
      email: customer.email,
      orders_count: customer.orders_count,
      total_spent: rawSpent,
      join_date: formattedDate,
      status: customer.status
    });
    setIsEditMode(true);
    setEditId(customer.id);
    setIsAddEditModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      apiFetch(`/api/admin/customers/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => fetchCustomers())
        .catch(err => console.error('Delete error:', err));
    }
  };

  const handleSaveCustomer = () => {
    setSaving(true);
    const nameParts = newCustomer.name.trim().split(' ');
    let init = 'CU';
    if (nameParts.length > 0 && nameParts[0].length > 0) {
      init = nameParts.length === 1 
        ? nameParts[0].substring(0, 2).toUpperCase() 
        : (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }

    const payload = {
      ...newCustomer,
      initials: init
    };

    const url = isEditMode
      ? `/api/admin/customers/${editId}`
      : '/api/admin/customers';
    const method = isEditMode ? 'PUT' : 'POST';

    apiFetch(url, {
      method,
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setSaving(false);
        setIsAddEditModalOpen(false);
        fetchCustomers();
        showStatusModal({
          type: 'success',
          title: 'CUSTOMER SAVED',
          message: 'Customer information has been successfully updated.'
        });
      })
      .catch(err => {
        console.error('Save error:', err);
        setSaving(false);
      });
  };

  const filteredCustomers = data.customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.customer_id && c.customer_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="loading">Loading Customers...</div>;

  return (
    <div className="customers-page">
      <Header 
        title="Customer Management" 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        searchPlaceholder="Search customers..."
      />

      <div className="customers-stats-row">
        <div className="customer-stat-card outline-gold">
          <p>Total Customers</p>
          <h2>{data.stats.totalCustomers || 0}</h2>
        </div>
        <div className="customer-stat-card outline-gold">
          <p>Active Customers</p>
          <h2>{data.stats.activeCount || 0}</h2>
        </div>
        <div className="customer-stat-card outline-gold">
          <p>New Customers</p>
          <h2 className="red-text">{data.stats.newMonthCount || 0}</h2>
        </div>
        
        <div className="customer-stat-card outline-gold special-action">
           <p className="white-text">Add a new Customer</p>
           <button className="gold-solid-btn" onClick={openAddModal}><Plus size={16}/> New Customer</button>
        </div>
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td className="id-col" style={{color: '#999', fontSize: '11px'}}>{c.customer_id || "---"}</td>
                  <td>
                    <div className="cust-info">
                      <span className="initials">{c.initials}</span>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="email-col">{c.email}</td>
                  <td>{c.orders_count}</td>
                  <td>{c.total_spent}</td>
                  <td>{c.join_date}</td>
                  <td><span className={`cust-status ${c.status.toLowerCase()}`}>{c.status}</span></td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-icn" onClick={() => openEditModal(c)}>
                        <Edit2 size={16}/>
                      </button>
                      <button className="action-icn" onClick={() => handleDelete(c.id)}>
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
                <tr><td colSpan="7" className="empty-table-msg text-center" style={{padding: '40px', color: '#555', fontStyle: 'italic'}}>No customers found matching your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content add-customer-modal">
            <div className="modal-header">
              <h3>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="close-btn" onClick={() => setIsAddEditModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="modal-body">
              <div className="form-row doublet">
                <div style={{flex: 1}}>
                  <label className="form-label">Full Name</label>
                  <input name="name" type="text" value={newCustomer.name} placeholder="Customer Name" onChange={handleInputChange} className="form-input" style={{width: '90%'}}/>
                </div>
                <div style={{flex: 1}}>
                  <label className="form-label">Email Address</label>
                  <input name="email" type="email" value={newCustomer.email} placeholder="Email" onChange={handleInputChange} className="form-input" style={{width: '90%'}}/>
                </div>
              </div>

              <div className="form-row triplet" style={{marginTop: '15px'}}>
                <div style={{flex: 1}}>
                  <label className="form-label">Orders Count</label>
                  <input name="orders_count" type="number" value={newCustomer.orders_count} placeholder="Orders" onChange={handleInputChange} className="form-input" style={{width: '80%'}}/>
                </div>
                <div style={{flex: 1}}>
                  <label className="form-label">Total Spent (Rs)</label>
                  <input name="total_spent" type="number" step="0.01" value={newCustomer.total_spent} placeholder="Spent" onChange={handleInputChange} className="form-input" style={{width: '80%'}}/>
                </div>
                <div style={{flex: 1}}>
                  <label className="form-label">Join Date</label>
                  <input name="join_date" type="date" value={newCustomer.join_date} onChange={handleInputChange} className="form-input" style={{width: '80%'}}/>
                </div>
              </div>

              <div className="form-row" style={{marginTop: '15px'}}>
                <div style={{flex: 1}}>
                  <label className="form-label">Status</label>
                  <select name="status" value={newCustomer.status} onChange={handleInputChange} className="form-select" style={{width: '40%'}}>
                     <option value="New">New</option>
                     <option value="Active">Active</option>
                     <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
               <button className="cancel-btn" onClick={() => setIsAddEditModalOpen(false)}>Cancel</button>
               <button className="gold-solid-btn" onClick={handleSaveCustomer} disabled={saving}>
                 {saving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Customer')}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
