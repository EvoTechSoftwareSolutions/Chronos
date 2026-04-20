import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { X, Package, MapPin, CreditCard, ChevronRight, Eye, Edit2, Trash2 } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import '../styles/Orders.css';

export default function Orders() {
  const navigate = useNavigate();
  const { showModal } = useModal();

  const [data, setData] = useState({ orders: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = () => {
    fetch('http://localhost:5001/api/admin/orders')
      .then(res => res.json())
      .then(json => {
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
    
    fetch(`http://localhost:5001/api/admin/orders/${cleanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
        showModal({
          type: 'error',
          title: 'Update Failed',
          message: err.message
        });
      });
  };

  const handleDeleteOrder = (id) => {
    const cleanId = id.replace('#', '');
    showModal({
      type: 'confirm',
      title: 'Delete Order?',
      message: `Are you sure you want to delete order ${id}? This action cannot be undone.`,
      onConfirm: () => {
        fetch(`http://localhost:5001/api/admin/orders/${cleanId}`, {
          method: 'DELETE'
        })
          .then(async res => {
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}`);
            }
            return res.json();
          })
          .then(json => {
            if (json.success) {
              fetchOrders();
              showModal({
                type: 'success',
                title: 'Delete Successful',
                message: `Order ${id} has been removed permanently.`
              });
            } else {
              showModal({ type: 'error', title: 'Error', message: json.message });
            }
          })
          .catch(err => {
            console.error("Delete error:", err);
            showModal({ 
              type: 'error', 
              title: 'Delete Failed', 
              message: err.message.includes('Unexpected token') 
                ? "The server returned an invalid response. Please check the backend logs."
                : err.message 
            });
          });
      }
    });
  };

  const filteredOrders = data?.orders?.filter(o => 
    o?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o?.customer_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o?.items_summary?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="id-col">{order.id}</td>
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
                    <select 
                      className={`status-select-badge ${order.status.toLowerCase()}`}
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Canceled">Canceled</option>
                    </select>
                  </td>
                  <td>
                      <div className="action-btns">
                        <button className="action-icn" title="View" onClick={() => setSelectedOrder(order)}>
                          <Eye size={18} />
                        </button>
                        <button className="action-icn" title="Edit" onClick={() => setSelectedOrder(order)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="action-icn delete" title="Delete" onClick={() => handleDeleteOrder(order.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" className="empty-table-msg text-center" style={{padding: '40px', color: '#555', fontStyle: 'italic'}}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Order Details <span className="gold-text">{selectedOrder.id}</span></h2>
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
                         </div>
                          <span className="item-price">
                             Rs. {Number(item.priceNum || parseFloat(String(item.price || 0).replace(/[^0-9.]/g, '')) || 0).toLocaleString()}
                          </span>
                       </div>
                   ))}
                </div>
                <div className="order-summary-box">
                   <div className="summary-row">
                      <span>Subtotal</span>
                      <span>Rs. {Number(selectedOrder.subtotal || 0).toLocaleString()}</span>
                   </div>
                   <div className="summary-row">
                      <span>Discount</span>
                      <span className="red-text">-Rs. {Number(selectedOrder.discount || 0).toLocaleString()}</span>
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
                       <p className={selectedOrder.payment_status?.toLowerCase()}>{selectedOrder.payment_status || 'Pending'}</p>
                    </div>
                    <div className="info-item">
                       <label>Order Status</label>
                       <div className="status-update-wrap">
                          <select 
                            className={`status-select-badge ${selectedOrder.status.toLowerCase()}`}
                            value={selectedOrder.status}
                            onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Canceled">Canceled</option>
                          </select>
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
