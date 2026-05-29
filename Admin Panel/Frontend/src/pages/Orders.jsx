import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { X, Package, MapPin, CreditCard, ChevronRight, Eye, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import '../styles/Orders.css';
import { apiFetch } from '../utils/api';

export default function Orders() {
  const [data, setData] = useState({ orders: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewStatus, setViewStatus] = useState('all');

  const { showModal } = useModal();

  const isPaid = (value) => String(value || '').trim() === 'Paid';
  const allowedCancelPaymentStatuses = ['pending', 'held', 'delayed', 'failed', 'canceled', 'cancelled', 'refund', 'refunded'];
  const canCancel = (paymentStatus) => 
    allowedCancelPaymentStatuses.includes(String(paymentStatus || '').trim().toLowerCase());

  const fetchOrders = () => {
    apiFetch('/api/admin/orders')
      .then(res => res.json())
      .then(json => {
        console.log("Orders Data:", json);
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = (id, newStatus) => {
    const cleanId = id.replace('#', '');
    
    apiFetch(`/api/admin/orders/${cleanId}`, {
      method: 'PUT',
      body: JSON.stringify({ order_status: newStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (json.success) {
          fetchOrders();
          showModal({
            type: 'success',
            title: 'Update Successful',
            message: `Order status for ${id} has been updated to ${newStatus}.`
          });
          if (selectedOrder && selectedOrder.id === id) {
             setSelectedOrder({ ...selectedOrder, status: newStatus });
          }
        }
      })
      .catch(err => {
        // UI disables invalid transitions (e.g. Shipped/Delivered while not Paid),
        // but keep a generic error for unexpected failures.
        showModal({ type: 'error', title: 'Update Failed', message: err.message });
      });
  };

  const handlePaymentStatusUpdate = (id, newPaymentStatus) => {
    const cleanId = id.replace('#', '');
    
    apiFetch(`/api/admin/orders/${cleanId}`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status: newPaymentStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (json.success) {
          fetchOrders();
          showModal({
            type: 'success',
            title: 'Update Successful',
            message: `Payment status for ${id} has been updated to ${newPaymentStatus}.`
          });
          if (selectedOrder && selectedOrder.id === id) {
             setSelectedOrder({ ...selectedOrder, payment_status: newPaymentStatus });
          }
        }
      })
      .catch(err => {
        showModal({
          type: 'error',
          title: 'Update Failed',
          message: err.message
        });
      });
  };
  const handleToggleOrderStatus = (id, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    const cleanId = id.replace('#', '');
    
    apiFetch(`/api/admin/orders/${cleanId}/toggle-status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: newStatus })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success || json.message) {
          fetchOrders();
          showModal({
            type: 'success',
            title: 'Status Updated',
            message: `Order ${id} has been ${action}d successfully.`
          });
        }
      })
      .catch(err => {
        showModal({
          type: 'error',
          title: 'Status Update Failed',
          message: err.message
        });
      });
  };

  const filteredOrders = data?.orders?.filter(o => {
    const matchSearch = o?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o?.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o?.items_summary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = viewStatus === 'all' || 
                        (viewStatus === 'active' && o.is_active) || 
                        (viewStatus === 'inactive' && !o.is_active);
    
    return matchSearch && matchStatus;
  }) || [];

  if (loading) return <div className="loading">Loading Orders...</div>;

  return (
    <div className="orders-page">
      <Header 
        title="Order Management" 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        searchPlaceholder="Search orders..."
      />

      <div className="orders-stats-row">
        <div className="order-stat-card outline-gold">
          <p>Total Orders</p>
          <h2>{data.stats.totalOrders || 0}</h2>
        </div>
        <div className="order-stat-card outline-gold">
          <p>Pending</p>
          <h2>{data.stats.pendingCount || 0}</h2>
        </div>
        <div className="order-stat-card outline-gold">
          <p>Shipped</p>
          <h2 className="red-text">{data.stats.shippedCount || 0}</h2>
        </div>
        <div className="order-stat-card outline-gold">
          <p>Delivered</p>
          <h2>{data.stats.deliveredCount || 0}</h2>
        </div>
      </div>

      <div className="orders-table-container">
        <div className="table-header-actions" style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #1a1a1a' }}>
          <select className="filter-select" value={viewStatus} onChange={(e) => setViewStatus(e.target.value)} style={{ padding: '8px 12px', background: '#0a0a0a', border: '1px solid #d4af37', color: '#fff', borderRadius: '4px' }}>
            <option value="all">Show: All Orders</option>
            <option value="active">Show: Active Only</option>
            <option value="inactive">Show: Inactive Only</option>
          </select>
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer ID</th>
              <th>Customer</th>
              <th>Shipping Detail</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id} className={!order.is_active ? 'frozen-row' : ''}>
                  <td className="id-col" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {order.id}
                    {!order.is_active && (
                      <span className="frozen-tag">
                        FROZEN
                      </span>
                    )}
                  </td>
                  <td className="id-col">
                    <span className={`id-badge ${String(order.customer_id || '').startsWith('ACC-') ? 'account' : 'guest'}`}>
                      {order.customer_id || 'N/A'}
                    </span>
                  </td>
                  <td>{order.customer || 'Customer'}</td>
                  <td className="shipping-col">
                    <div className="shipping-brief">
                      <strong>{order.first_name || '---'} {order.last_name || ''}</strong>
                      <span>{order.city || 'No Address'}</span>
                    </div>
                  </td>
                  <td className="date-col">{order.date_formatted}</td>
                  <td className="items-col">{order.items_summary}</td>
                  <td>{order.total_formatted}</td>
                  <td>
                    <span className={`id-badge ${String(order.payment_status || 'Pending').toLowerCase()}`}>
                      {order.payment_status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {(() => {
                      const canShipDeliver = isPaid(order.payment_status);
                      return (
                    <select 
                      className={`status-select-badge ${order.status.toLowerCase()}`}
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      disabled={!order.is_active}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped" disabled={!canShipDeliver}>Shipped</option>
                      <option value="Delivered" disabled={!canShipDeliver}>Delivered</option>
                      <option value="Canceled" disabled={!canCancel(order.payment_status)}>Canceled</option>
                    </select>
                      );
                    })()}
                  </td>
                  <td>
                      <div className="action-btns">
                        <button className="action-icn" title="View" onClick={() => setSelectedOrder(order)}>
                          <Eye size={18} />
                        </button>
                        <button className="action-icn" title="Edit" onClick={() => setSelectedOrder(order)}>
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className={`action-icn ${order.is_active ? 'active' : 'inactive'}`}
                          title={order.is_active ? 'Deactivate Order' : 'Activate Order'}
                          onClick={() => handleToggleOrderStatus(order.id, order.is_active)}
                        >
                          {order.is_active ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </button>
                      </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="10" className="empty-table-msg text-center" style={{padding: '40px', color: '#555', fontStyle: 'italic'}}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                Order Details <span className="gold-text">{selectedOrder.id}</span>
                {!selectedOrder.is_active && (
                  <span className="frozen-tag modal-frozen-tag">
                    FROZEN
                  </span>
                )}
              </h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}><X size={24}/></button>
            </div>
            
            <div className="modal-body scrollable">
              <div className="detail-section">
                 <h4 className="section-label">Customer Information</h4>
                 <div className="info-grid">
                    <div className="info-item">
                       <label>Name</label>
                       <p>{selectedOrder.customer}</p>
                    </div>
                    <div className="info-item">
                       <label>Email</label>
                       <p>{selectedOrder.email}</p>
                    </div>
                    <div className="info-item">
                       <label>Phone</label>
                       <p>{selectedOrder.mobile || 'N/A'}</p>
                    </div>
                 </div>
              </div>

              <div className="detail-section">
                <h4 className="section-label">Shipping & Delivery</h4>
                <div className="info-grid mb-4">
                    <div className="info-item">
                       <label>Method</label>
                       <p className="gold-text font-bold">{selectedOrder.shipping_method || 'Standard Delivery'}</p>
                    </div>
                </div>
                <div className="address-box">
                   <MapPin size={16} className="gold-text"/>
                   <p>{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.province} {selectedOrder.zip_code}</p>
                </div>
              </div>

              <div className="detail-section">
                <h4 className="section-label">Order Items</h4>
                <div className="items-list">
                   {JSON.parse(selectedOrder.items || '[]').map((item, idx) => (
                      <div key={idx} className="order-product-row">
                         <div className="product-brief">
                            <span className="qty-tag">{item.quantity}x</span>
                            <span className="product-name">{item.name}</span>
                            {item.strap_size || item.strapSize ? (
                              <span className="product-meta">
                                Strap size: <strong>{item.strap_size || item.strapSize}</strong>
                              </span>
                            ) : null}
                         </div>
                         <span className="item-price">Rs {(item.priceNum || 0).toLocaleString()}</span>
                      </div>
                   ))}
                </div>
                <div className="order-summary-box">
                   <div className="summary-row">
                      <span>Subtotal</span>
                      <span>Rs {Number(selectedOrder.subtotal || 0).toLocaleString()}</span>
                   </div>
                   <div className="summary-row">
                      <span>Discount</span>
                      <span className="red-text">-Rs {Number(selectedOrder.discount || 0).toLocaleString()}</span>
                   </div>
                   <div className="summary-row total-row">
                      <span>Total</span>
                      <span className="gold-text">{selectedOrder.total_formatted}</span>
                   </div>
                </div>
              </div>

              <div className="detail-section">
                 <h4 className="section-label">Payment & Status</h4>
                 <div className="info-grid">
                    <div className="info-item">
                       <label>Method</label>
                       <p>{selectedOrder.payment_method || 'Credit Card'}</p>
                    </div>
                    <div className="info-item">
                       <label>Payment Status</label>
                       <div className="status-update-wrap">
                          <select 
                            className={`status-select-badge ${selectedOrder.payment_status?.toLowerCase() || 'pending'}`}
                            value={selectedOrder.payment_status || 'Pending'}
                            onChange={(e) => handlePaymentStatusUpdate(selectedOrder.id, e.target.value)}
                            disabled={!selectedOrder.is_active}
                          >
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Held">Held</option>
                            <option value="Delayed">Delayed</option>
                            <option value="Failed">Failed</option>
                            <option value="Canceled">Canceled</option>
                          </select>
                       </div>
                    </div>
                    <div className="info-item">
                       <label>Order Status</label>
                       <div className="status-update-wrap">
                          {(() => {
                            const canShipDeliver = isPaid(selectedOrder.payment_status);
                            return (
                          <select 
                            className={`status-select-badge ${selectedOrder.status.toLowerCase()}`}
                            value={selectedOrder.status}
                            onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                            disabled={!selectedOrder.is_active}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped" disabled={!canShipDeliver}>Shipped</option>
                            <option value="Delivered" disabled={!canShipDeliver}>Delivered</option>
                            <option value="Canceled" disabled={!canCancel(selectedOrder.payment_status)}>Canceled</option>
                          </select>
                            );
                          })()}
                       </div>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="modal-footer">
               <button className="gold-solid-btn" onClick={() => setSelectedOrder(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
