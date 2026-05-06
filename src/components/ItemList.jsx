import React from 'react';
import { Plus, Trash2, ChevronDown, Search, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const ItemList = ({ items, setItems, onAddDiscount, onQrUpload, qrCode, savedProducts = [], navigateTo }) => {
  const fileInputRef = React.useRef(null);
  const [activeDropdown, setActiveDropdown] = React.useState(null);

  const handleQrClick = () => {
    fileInputRef.current?.click();
  };

  const [uploadStatus, setUploadStatus] = React.useState({ uploading: false, progress: 0, error: null, success: false });

  const handleQrChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadStatus({ uploading: true, progress: 0, error: 'Please select a valid image file.', success: false });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadStatus({ uploading: true, progress: 0, error: 'File size exceeds 2MB limit.', success: false });
      return;
    }

    setUploadStatus({ uploading: true, progress: 0, error: null, success: false });
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadStatus(prev => ({ ...prev, progress: percent }));
      }
    };
    reader.onloadend = () => {
      setTimeout(() => {
        onQrUpload(reader.result);
        setUploadStatus({ uploading: true, progress: 100, error: null, success: true });
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Auto close after success
        setTimeout(() => {
          setUploadStatus({ uploading: false, progress: 0, error: null, success: false });
        }, 1500);
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), name: '', qty: 0, price: 0, gstPercent: 0 }
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id, fieldOrObject, value) => {
    setItems(prevItems => 
      prevItems.map((item) => {
        if (item.id === id) {
          if (typeof fieldOrObject === 'object') {
            return { ...item, ...fieldOrObject };
          }
          return { ...item, [fieldOrObject]: value };
        }
        return item;
      })
    );
  };

  const selectProduct = (id, product) => {
    updateItem(id, {
      name: product.name,
      price: product.price,
      gstPercent: product.gstPercent
    });
    setActiveDropdown(null);
  };

  const getItemBase = (item) => {
    const qty = Number(item.qty || 0);
    const price = Number(item.price || 0);
    return qty * price;
  };

  const getItemTax = (item) => {
    const gstPercent = Number(item.gstPercent || 0);
    return (getItemBase(item) * gstPercent) / 100;
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="item-list-container" style={{ padding: 0 }}>
      <div className="item-list-header">
        <h3 className="text-xl">Invoice Items</h3>
        <div className="header-actions">
          <button
            type="button"
            onClick={onAddDiscount}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={16} /> Discount
          </button>
          <button type="button" onClick={addItem} className="btn btn-dark btn-sm">
            <Plus size={16} /> Add Item
          </button>
          <input type="file" ref={fileInputRef} onChange={handleQrChange} accept="image/*" style={{ display: 'none' }} />
          <button type="button" onClick={handleQrClick} className={`btn ${qrCode ? 'btn-success' : 'btn-outline'} btn-sm`}>
            <Plus size={16} /> QR
          </button>
        </div>
      </div>

      <div className="items-table-wrapper" style={{ overflow: 'visible' }}>
        <div className="items-thead">
          <div className="col-desc">Item Description</div>
          <div className="col-price">Price</div>
          <div className="col-qty">Qty</div>
          <div className="col-tax">GST %</div>
          <div className="col-total">Total</div>
          <div className="col-actions"></div>
        </div>

        <div className="items-tbody">
          {items.map((item) => (
            <div key={item.id} className="item-row animate-fade-in">
              <div className="col-desc" onClick={(e) => e.stopPropagation()}>
                <label className="mobile-label">Description</label>
                <div className="searchable-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search or type product"
                    value={item.name}
                    onChange={(e) => {
                      updateItem(item.id, 'name', e.target.value);
                      setActiveDropdown(item.id);
                    }}
                    onFocus={() => setActiveDropdown(item.id)}
                    className="item-input-field"
                  />
                  <div className="search-icon-hint">
                    <Search size={14} />
                  </div>
                  
                  {activeDropdown === item.id && (
                    <div className="product-suggestions-dropdown shadow-lg animate-fade-in">
                      <div className="dropdown-label">Saved Products</div>
                      {savedProducts.length > 0 ? (
                        savedProducts
                          .filter(p => p.name.toLowerCase().includes((item.name || '').toLowerCase()))
                          .map(p => (
                            <div 
                              key={p.id} 
                              className="suggestion-item"
                              onClick={() => selectProduct(item.id, p)}
                            >
                              <div className="suggestion-name">{p.name}</div>
                              <div className="suggestion-meta">₹{p.price} | {p.gstPercent}% GST</div>
                            </div>
                          ))
                      ) : (
                        <div className="no-suggestions">No products found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-price">
                <label className="mobile-label">Price</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={item.price === 0 ? '' : item.price}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = val.split('.');
                    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                    updateItem(item.id, 'price', val);
                  }}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="col-qty">
                <label className="mobile-label">Qty</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={item.qty === 0 ? '' : item.qty}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    updateItem(item.id, 'qty', val === '' ? 0 : parseInt(val, 10));
                  }}
                  placeholder="0"
                />
              </div>

              <div className="col-tax">
                <label className="mobile-label">GST %</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={item.gstPercent === 0 ? '' : item.gstPercent}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = val.split('.');
                    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                    if (parseFloat(val) > 100) val = '100';
                    updateItem(item.id, 'gstPercent', val);
                  }}
                  placeholder="0"
                />
              </div>

              <div className="mobile-bottom-row">
                <div className="col-total">
                  <label className="mobile-label">Total</label>
                  <div className="total-value">
                    ₹{(getItemBase(item) + getItemTax(item)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="mobile-actions-container">
                  <button type="button" onClick={() => removeItem(item.id)} className="delete-item-btn mobile-delete-btn">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="col-actions desktop-only">
                <button type="button" onClick={() => removeItem(item.id)} className="delete-item-btn">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {uploadStatus.uploading && (
        <div className="upload-modal-overlay">
          <div className="upload-modal animate-fade-in">
            <div className="upload-modal-content">
              {uploadStatus.error ? (
                <div className="status-container error">
                  <div className="status-icon"><AlertCircle size={32} /></div>
                  <h4>Upload Failed</h4>
                  <p>{uploadStatus.error}</p>
                  <button 
                    className="btn btn-dark btn-sm" 
                    onClick={() => setUploadStatus({ uploading: false, progress: 0, error: null, success: false })}
                    style={{ marginTop: '1rem' }}
                  >
                    Close
                  </button>
                </div>
              ) : uploadStatus.success ? (
                <div className="status-container success">
                  <div className="status-icon"><CheckCircle2 size={32} /></div>
                  <h4>Logo Uploaded!</h4>
                  <p>Your QR code has been successfully added to the invoice.</p>
                </div>
              ) : (
                <div className="status-container">
                  <div className="status-icon"><Loader2 size={32} className="animate-spin" /></div>
                  <h4>Processing QR Code</h4>
                  <p>We are preparing your payment QR for the invoice...</p>
                  
                  <div className="qr-progress-container">
                    <div className="qr-progress-track">
                      <div className="qr-progress-fill" style={{ width: `${uploadStatus.progress}%` }}></div>
                    </div>
                    <div className="qr-progress-text">{uploadStatus.progress}% Complete</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .upload-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .upload-modal {
          background: white;
          width: 100%;
          max-width: 400px;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          text-align: center;
        }

        .status-container h4 {
          margin: 1rem 0 0.5rem;
          font-size: 1.25rem;
          color: var(--primary);
        }

        .status-container p {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .status-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .status-container.success .status-icon { color: #10b981; }
        .status-container.error .status-icon { color: var(--error); }
        .status-container:not(.success):not(.error) .status-icon { color: var(--accent); }

        .qr-progress-container {
          margin-top: 1.5rem;
        }

        .qr-progress-track {
          width: 100%;
          height: 6px;
          background: #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .qr-progress-fill {
          height: 100%;
          background: var(--accent);
          transition: width 0.3s ease-out;
        }

        .qr-progress-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .searchable-input-wrapper {
          position: relative;
          width: 100%;
        }

        .search-icon-hint {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          opacity: 0.5;
          pointer-events: none;
        }

        .product-suggestions-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          z-index: 100;
          max-height: 250px;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
        }

        .dropdown-label {
          padding: 8px 12px;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          background: #f8fafc;
          border-bottom: 1px solid var(--border);
        }

        .suggestion-item {
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 1px solid #f1f5f9;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: var(--accent-soft);
        }

        .suggestion-name {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--primary);
        }

        .suggestion-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .no-suggestions {
          padding: 12px;
          font-size: 0.875rem;
          color: var(--text-muted);
          text-align: center;
        }

        .item-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }

        .btn-outline:hover {
          background: var(--accent-soft);
          border-color: var(--accent);
          color: var(--accent);
        }

        .btn-success {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .items-thead {
          display: grid;
          grid-template-columns: 2fr 1.2fr 0.8fr 0.8fr 1fr 40px;
          gap: 1rem;
          padding: 0 0.5rem;
          margin-bottom: 0.75rem;
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .item-row {
          display: grid;
          grid-template-columns: 2fr 1.2fr 0.8fr 0.8fr 1fr 40px;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1rem;
          background: transparent;
          position: relative;
        }

        .item-row input {
          border-color: var(--border);
          padding: 0.6rem 0.75rem;
          font-size: 0.85rem;
        }

        .item-row input:focus {
          border-color: var(--accent);
          background: #fff;
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .total-value {
          font-weight: 700;
          color: var(--primary);
          font-size: 0.95rem;
        }

        .delete-item-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          color: var(--error);
          background: transparent;
          transition: all 0.2s;
        }

        .delete-item-btn:hover {
          background: #fff1f2;
          color: #dc2626;
        }

        .mobile-label { display: none; }
        .mobile-delete-btn { display: none; }
        .mobile-actions-container { display: none; }
        .mobile-bottom-row { display: contents; }

        @media (max-width: 640px) {
          .desktop-only { display: none; }
          .mobile-delete-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; }
          .mobile-actions-container { display: flex; align-items: center; justify-content: flex-end; }
          .items-thead { display: none; }
          .item-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.4rem;
            padding: 0.6rem;
            background: #f8fafc;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            margin-bottom: 0.75rem;
          }
          .item-row input { padding: 0.35rem; font-size: 0.65rem; }
          .mobile-label {
            display: block;
            font-size: 0.55rem;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-bottom: 0.1rem;
            letter-spacing: 0.5px;
          }
          .col-desc { grid-column: span 3; }
          .mobile-bottom-row {
            grid-column: span 3;
            display: flex;
            gap: 0.75rem;
            align-items: stretch;
          }
          .col-total {
            flex: 1;
            background: var(--accent-soft);
            padding: 0.4rem 0.6rem;
            border-radius: var(--radius-sm);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid var(--accent);
          }
          .total-value { font-size: 0.95rem; }
        }
        .item-input-field {
          width: 100%;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          padding: 0.6rem 0.75rem;
          font-size: 0.85rem;
          background: white;
        }
        
        .item-input-field:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default ItemList;
