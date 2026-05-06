import React, { useState } from 'react';
import { Plus, Edit2, Trash2, User, Phone, Mail, MapPin, ArrowLeft } from 'lucide-react';

const getEmptyCustomer = () => ({
  id: '',
  customerName: '',
  email: '',
  phone: '',
  address: ''
});

const CustomerDetailsPage = ({
  savedCustomers,
  onSaveCustomer,
  onDeleteCustomer
}) => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [customerData, setCustomerData] = useState(getEmptyCustomer());
  const [statusMessage, setStatusMessage] = useState({ type: 'info', message: 'Manage your customer profiles for quick invoice generation.' });

  const handleEdit = (customer) => {
    setCustomerData(customer);
    setView('form');
  };

  const handleCreate = () => {
    setCustomerData(getEmptyCustomer());
    setView('form');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!customerData.customerName.trim() || !customerData.email.trim() || !customerData.phone.trim() || !customerData.address.trim()) {
      setStatusMessage({ type: 'error', message: 'All fields are required.' });
      return;
    }

    try {
      await onSaveCustomer(customerData);
      setStatusMessage({ type: 'success', message: 'Customer saved successfully.' });
      setView('list');
    } catch (error) {
      setStatusMessage({ type: 'error', message: 'Failed to save customer.' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await onDeleteCustomer(id);
        setStatusMessage({ type: 'success', message: 'Customer deleted successfully.' });
      } catch (error) {
        setStatusMessage({ type: 'error', message: 'Failed to delete customer.' });
      }
    }
  };

  if (view === 'form') {
    return (
      <div className="customer-page-container animate-fade-in">
        <div className="form-header">
          <button className="back-btn" onClick={() => setView('list')}>
            <ArrowLeft size={20} /> Back to List
          </button>
          <h2>{customerData.id ? 'Edit Customer' : 'Create New Customer'}</h2>
        </div>

        <div className="card customer-form-card">
          <div className="customer-form-grid">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={customerData.customerName}
                onChange={handleChange}
                placeholder="Full Name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={customerData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={customerData.phone}
                onChange={handleChange}
                placeholder="+91 00000 00000"
                required
              />
            </div>
            <div className="form-group grid-span-all">
              <label>Full Address</label>
              <textarea
                name="address"
                rows="3"
                value={customerData.address}
                onChange={handleChange}
                placeholder="Street, City, State, ZIP"
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setView('list')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Customer</button>
          </div>
        </div>

        <style jsx>{`
          .form-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
          .back-btn { background: none; border: none; color: var(--accent); display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
          .customer-form-card { padding: 2rem; }
          .customer-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
          .grid-span-all { grid-column: 1 / -1; }
          .form-actions { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
          @media (max-width: 768px) { .customer-form-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="customer-page-container animate-fade-in">
      <div className="list-header">
        <div className="header-info">
          <h2>Customers</h2>
          <p className="text-muted">Manage your saved customer profiles</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={20} /> Create Customer
        </button>
      </div>

      {statusMessage.message && (
        <div className={`status-banner ${statusMessage.type === 'success' ? 'status-success' : statusMessage.type === 'error' ? 'status-error' : 'status-info'}`}>
          {statusMessage.message}
        </div>
      )}

      <div className="customer-grid">
        {savedCustomers.length === 0 ? (
          <div className="empty-state">
            <User size={48} className="text-muted" />
            <p>No customers saved yet.</p>
          </div>
        ) : (
          savedCustomers.map((customer) => (
            <div key={customer.id} className="card customer-card animate-fade-in">
              <div className="customer-info">
                <div className="customer-name-row">
                  <div className="avatar-circle">
                    {customer.customerName.charAt(0).toUpperCase()}
                  </div>
                  <h3>{customer.customerName}</h3>
                </div>
                <div className="info-item">
                  <Phone size={14} className="text-muted" />
                  <span>{customer.phone}</span>
                </div>
                <div className="info-item">
                  <Mail size={14} className="text-muted" />
                  <span>{customer.email}</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="action-btn edit-btn" onClick={() => handleEdit(customer)} title="Edit">
                  <Edit2 size={18} />
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(customer.id)} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .customer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .customer-card { padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; }
        .customer-name-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .avatar-circle { width: 40px; height: 40px; background: var(--accent-soft); color: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .info-item { display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.5rem; }
        .card-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
        .action-btn { width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .edit-btn { background: var(--accent-soft); color: var(--accent); }
        .edit-btn:hover { background: var(--accent); color: white; }
        .delete-btn { background: #fff1f2; color: var(--error); }
        .delete-btn:hover { background: var(--error); color: white; }
        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 0; color: var(--text-muted); }
      `}</style>
    </div>
  );
};

export default CustomerDetailsPage;
