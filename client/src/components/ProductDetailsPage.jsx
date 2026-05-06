import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package, Tag, ArrowLeft } from 'lucide-react';

const getEmptyProduct = () => ({
  id: '',
  name: '',
  price: '',
  gstPercent: '0'
});

const ProductDetailsPage = ({
  savedProducts,
  onSaveProduct,
  onDeleteProduct
}) => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [productData, setProductData] = useState(getEmptyProduct());
  const [statusMessage, setStatusMessage] = useState({ type: 'info', message: 'Manage your reusable inventory items and pricing.' });

  const handleEdit = (product) => {
    setProductData(product);
    setView('form');
  };

  const handleCreate = () => {
    setProductData(getEmptyProduct());
    setView('form');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price' && value !== '') {
        if (!/^\d*\.?\d*$/.test(value)) return;
    }
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!productData.name.trim() || !productData.price) {
      setStatusMessage({ type: 'error', message: 'Item name and price are required.' });
      return;
    }

    try {
      await onSaveProduct(productData);
      setStatusMessage({ type: 'success', message: 'Item saved successfully.' });
      setView('list');
    } catch (error) {
      setStatusMessage({ type: 'error', message: 'Failed to save item.' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await onDeleteProduct(id);
        setStatusMessage({ type: 'success', message: 'Item deleted successfully.' });
      } catch (error) {
        setStatusMessage({ type: 'error', message: 'Failed to delete item.' });
      }
    }
  };

  if (view === 'form') {
    return (
      <div className="product-page-container animate-fade-in">
        <div className="form-header">
          <button className="back-btn" onClick={() => setView('list')}>
            <ArrowLeft size={20} /> Back to List
          </button>
          <h2>{productData.id ? 'Edit Item' : 'Create New Item'}</h2>
        </div>

        <div className="card product-form-card">
          <div className="product-form-grid">
            <div className="form-group grid-span-all">
              <label>Item Name</label>
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleChange}
                placeholder="e.g., Professional Consulting"
                required
              />
            </div>
            <div className="form-group">
              <label>Base Price (₹)</label>
              <input
                type="text"
                inputMode="decimal"
                name="price"
                value={productData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setView('list')}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Item</button>
          </div>
        </div>

        <style jsx>{`
          .form-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
          .back-btn { background: none; border: none; color: var(--accent); display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
          .product-form-card { padding: 2rem; max-width: 600px; }
          .product-form-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2rem; }
          .form-actions { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="product-page-container animate-fade-in">
      <div className="list-header">
        <div className="header-info">
          <h2>Items & Products</h2>
          <p className="text-muted">Manage your reusable inventory and pricing</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={20} /> Create Item
        </button>
      </div>

      {statusMessage.message && (
        <div className={`status-banner ${statusMessage.type === 'success' ? 'status-success' : statusMessage.type === 'error' ? 'status-error' : 'status-info'}`}>
          {statusMessage.message}
        </div>
      )}

      <div className="product-grid">
        {savedProducts.length === 0 ? (
          <div className="empty-state">
            <Package size={48} className="text-muted" />
            <p>No items saved yet.</p>
          </div>
        ) : (
          savedProducts.map((product) => (
            <div key={product.id} className="card product-card animate-fade-in">
              <div className="product-info">
                <div className="product-icon-row">
                  <div className="icon-circle">
                    <Tag size={20} />
                  </div>
                  <h3>{product.name}</h3>
                </div>
                <div className="price-display">
                  <span className="currency">₹</span>
                  <span className="amount">{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="action-btn edit-btn" onClick={() => handleEdit(product)} title="Edit">
                  <Edit2 size={18} />
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(product.id)} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .product-card { padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; height: 100%; }
        .product-icon-row { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
        .icon-circle { width: 40px; height: 40px; background: var(--accent-soft); color: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .product-icon-row h3 { font-size: 1.1rem; margin: 0; line-height: 1.3; }
        .price-display { background: var(--background); padding: 0.75rem 1rem; border-radius: var(--radius-sm); display: flex; align-items: baseline; gap: 0.25rem; }
        .currency { font-size: 0.875rem; color: var(--text-muted); font-weight: 600; }
        .amount { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
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

export default ProductDetailsPage;
