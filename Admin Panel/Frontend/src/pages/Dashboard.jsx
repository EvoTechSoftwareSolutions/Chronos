import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Plus, Eye, FileText, Users, DollarSign, ShoppingCart, Box, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Administrator');
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('adminUser'));
    if (admin && admin.name) setAdminName(admin.name);

    fetch('http://localhost:5001/api/admin/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredOrders = data?.recentOrders?.filter(o => 
    o?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o?.product?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading || !data) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard">
      <Header 
        title={`Welcome back, ${adminName}`} 
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        searchPlaceholder="Search orders..."
      />

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="icon-wrap gold-border"><DollarSign size={18} /></div>
            <div className="trend green"><TrendingUp size={14} /> +12.5%</div>
          </div>
          <div className="stat-card-body">
            <h2>{data.stats.revenue.value}</h2>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="icon-wrap gold-border"><ShoppingCart size={18} /></div>
            <div className="trend green"><TrendingUp size={14} /> +8.2%</div>
          </div>
          <div className="stat-card-body">
            <h2>{data.stats.orders.value}</h2>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="icon-wrap gold-border"><Users size={18}/></div>
            <div className="trend green"><TrendingUp size={14} /> +5.1%</div>
          </div>
          <div className="stat-card-body">
            <h2>{data.stats.customers.value}</h2>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="icon-wrap gold-border"><Box size={18}/></div>
            <div className="trend neutral"><TrendingUp size={14} color="#22c55e" /> <span style={{color: '#22c55e'}}>0%</span></div>
          </div>
          <div className="stat-card-body">
            <h2>{data.stats.products.value}</h2>
            <p>Products</p>
          </div>
        </div>
      </div>

      <div className="middle-row">
        <div className="recent-orders">
          <div className="section-header">
            <h3>Recent Orders</h3>
            {searchTerm && <span className="search-result-count">{filteredOrders.length} results found</span>}
          </div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="id-col">{order.id}</td>
                    <td>{order.customer}</td>
                    <td className="product-col">{order.product}</td>
                    <td className="amount-col">{order.amount}</td>
                    <td><span className="neutral-badge">{order.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="empty-table-msg text-center">No orders matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <button onClick={() => navigate('/products?add=true')}><Plus size={16}/> Add New Product</button>
          <button onClick={() => navigate('/orders')}><Eye size={16}/> View All Orders</button>
          <button onClick={() => window.print()}><FileText size={16}/> Generate Report</button>
          <button onClick={() => navigate('/customers')}><Users size={16}/> Manage Users</button>
        </div>
      </div>

      <div className="bottom-row">
        <div className="revenue-trend">
          <h3>Revenue Trend</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#333" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis dataKey="value" stroke="#333" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
                <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px'}} itemStyle={{color: '#d4af37'}}/>
                <Area type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="top-selling">
          <h3>Top Selling Products</h3>
          <div className="bars-wrap">
            {data.topProducts.map((p, i) => (
              <div className="bar-row" key={i}>
                <span className="bar-label">{p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}</span>
                <div className="gold-solid-bar" style={{width: `${Math.max(15, p.value)}%`}}></div>
              </div>
            ))}
          </div>
          <div className="bar-axis">
             <span>0</span>
             <span>30</span>
             <span>60</span>
          </div>
        </div>
      </div >
    </div >
  );
}
