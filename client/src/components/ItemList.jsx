import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const ItemList = ({ items, setItems, onAddDiscount, onQrUpload, qrCode, savedProducts = [], navigateTo }) => {
  const fileInputRef = React.useRef(null);

  const handleQrClick = () => {
    fileInputRef.current?.click();
  };

  const [uploadStatus, setUploadStatus] = React.useState({ uploading: false, progress: 0, error: null });

  const handleQrChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation: Only images
    if (!file.type.startsWith('image/')) {
      setUploadStatus({ uploading: false, progress: 0, error: 'Please select a valid image file.' });
      return;
    }

    // Validation: Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setUploadStatus({ uploading: false, progress: 0, error: 'File size exceeds 2MB limit.' });
      return;
    }

    setUploadStatus({ uploading: true, progress: 0, error: null });

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadStatus(prev => ({ ...prev, progress: percent }));
      }
    };

    reader.onloadstart = () => {
       setUploadStatus({ uploading: true, progress: 0, error: null });
    };

    reader.onloadend = () => {
      // Small simulated delay for better UX on fast loads
      setTimeout(() => {
        onQrUpload(reader.result);
        setUploadStatus({ uploading: false, progress: 100, error: null });
        // Clear the file input so the same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 800);
    };

    reader.onerror = () => {
      setUploadStatus({ uploading: false, progress: 0, error: 'Failed to read file.' });
    };

    reader.readAsDataURL(file);
  };
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        name: '',
        qty: 0,
        price: 0,
        gstPercent: 0
      }
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const getItemBase = (item) => {
    const qty = Number(item.qty || 0) > 0 ? Number(item.qty) : 1;
    return qty * Number(item.price || 0);
  };

  const getItemTax = (item) => {
    const gstPercent = Number(item.gstPercent || 0);
    return (getItemBase(item) * gstPercent) / 100;
  };

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
          <button 
            type="button" 
            onClick={addItem}
            className="btn btn-dark btn-sm"
          >
            <Plus size={16} /> Add Item
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleQrChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button 
            type="button" 
            onClick={handleQrClick}
            className={`btn ${qrCode ? 'btn-success' : 'btn-outline'} btn-sm`}
            title={qrCode ? "QR Uploaded" : "Upload Payment QR"}
          >
            <Plus size={16} /> QR
          </button>
        </div>
      </div>

      <div className="items-table-wrapper">
        <div className="items-thead">
          <div className="col-desc">Item Description</div>
          <div className="col-qty">Qty</div>
          <div className="col-price">Price</div>
          <div className="col-tax">GST %</div>
          <div className="col-total">Total</div>
          <div className="col-actions"></div>
        </div>

        <div className="items-tbody">
          {items.map((item) => (
            <div key={item.id} className="item-row animate-fade-in">
              <div className="col-desc">
                <label className="mobile-label">Description</label>
                <div className="product-select-container">
                  <input
                    type="text"
                    placeholder="Service or product name"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    required
                    list={`products-${item.id}`}
                  />
                  <datalist id={`products-${item.id}`}>
                    {savedProducts.map(p => (
                      <option key={p.id} value={p.name}>
                        ₹{p.price} | GST: {p.gstPercent}%
                      </option>
                    ))}
                  </datalist>
                  <button 
                    type="button" 
                    className="add-new-product-link"
                    onClick={() => {
                      // Check if selected value matches a product name
                      const match = savedProducts.find(p => p.name === item.name);
                      if (match) {
                        updateItem(item.id, 'price', match.price);
                        updateItem(item.id, 'gstPercent', match.gstPercent);
                      } else {
                         navigateTo('/product-details');
                      }
                    }}
                    title={savedProducts.find(p => p.name === item.name) ? "Apply saved price" : "Add to items"}
                  >
                    {savedProducts.find(p => p.name === item.name) ? "Apply" : "Add New"}
                  </button>
                </div>
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
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="delete-item-btn mobile-delete-btn"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="col-actions desktop-only">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="delete-item-btn"
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Progress Modal */}
      {(uploadStatus.uploading || uploadStatus.error) && (
        <div className="upload-modal-overlay animate-fade-in" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="upload-modal" style={{
            width: '90%',
            maxWidth: '350px',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: uploadStatus.error ? '#ef4444' : '#111827' }}>
              {uploadStatus.error ? 'Upload Error' : 'Uploading Image'}
            </h4>
            
            {!uploadStatus.error ? (
              <>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  marginBottom: '1rem' 
                }}>
                  <div style={{ 
                    width: `${uploadStatus.progress}%`, 
                    height: '100%', 
                    backgroundColor: '#3b82f6',
                    transition: 'width 0.3s ease-out'
                  }} />
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  {uploadStatus.progress}% completed
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#64748b' }}>{uploadStatus.error}</p>
                <button 
                  onClick={() => setUploadStatus({ uploading: false, progress: 0, error: null })}
                  className="btn btn-dark"
                  style={{ width: '100%' }}
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
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

        @media (max-width: 640px) {
          .btn-sm {
            padding: 0.4rem 0.8rem;
            font-size: 0.75rem;
          }
        }

        .items-thead {
          display: grid;
          grid-template-columns: 2fr 0.8fr 1fr 0.8fr 1fr 40px;
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
          grid-template-columns: 2fr 0.8fr 1fr 0.8fr 1fr 40px;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1rem;
          background: transparent;
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

        .mobile-label {
          display: none;
        }

        .mobile-delete-btn {
          display: none;
        }

        .mobile-actions-container {
          display: none;
        }

        .mobile-bottom-row {
          display: contents;
        }

        @media (max-width: 640px) {
          .desktop-only {
            display: none;
          }

          .mobile-delete-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
          }
          .mobile-actions-container {
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }

          .items-thead {
            display: none;
          }

          .item-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
            padding: 1rem;
            background: #f8fafc;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            margin-bottom: 1.5rem;
          }

          .item-row input {
            padding: 0.5rem;
            font-size: 0.75rem;
          }

          .mobile-label {
            display: block;
            font-size: 0.65rem;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-bottom: 0.25rem;
            letter-spacing: 0.5px;
          }

          .col-desc {
            grid-column: span 3;
          }

          .mobile-bottom-row {
            grid-column: span 3;
            display: flex;
            gap: 0.75rem;
            align-items: stretch;
          }

          .col-total {
            flex: 1;
            background: var(--accent-soft);
            padding: 0.75rem 1rem;
            border-radius: var(--radius-sm);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid var(--accent);
          }

          .col-total .mobile-label {
            margin-bottom: 0;
            color: var(--primary);
          }

          .total-value {
            font-size: 0.95rem;
          }

          .col-actions {
            display: none;
          }

          .mobile-actions-container {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        .product-select-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .product-select-container input {
          flex: 1;
        }
        
        .add-new-product-link {
          background: var(--accent-soft);
          color: var(--accent);
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          text-transform: uppercase;
        }
        
        .add-new-product-link:hover {
          background: var(--accent);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ItemList;
