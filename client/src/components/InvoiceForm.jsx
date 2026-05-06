import React, { useEffect, useMemo, useState } from 'react';
import ItemList from './ItemList';
import { Download, FileText, Loader2, Eye, Plus } from 'lucide-react';
import { downloadInvoice, getInvoiceBlob, fetchNextInvoiceNumber } from '../services/api';
import InvoicePreview from './InvoicePreview';

const InvoiceForm = ({ savedCustomers, selectedCustomerId, onSelectCustomer, companyDetails, qrCode, onQrUpload, savedProducts, navigateTo }) => {
  const DISCOUNT_PRESETS = [0, 5, 10, 15, 20];
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    phone: '',
    address: '',
    email: '',
    discountPercent: 0,
    items: [{ id: 1, name: '', qty: 0, price: 0, gstPercent: 0 }]
  });

  const [totals, setTotals] = useState({ subtotal: 0, discountAmount: 0, grandTotal: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscountControl, setShowDiscountControl] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: 'info', message: 'Fill invoice details and download instantly.' });
  const activeCustomer = useMemo(
    () => savedCustomers.find((item) => item.id === selectedCustomerId),
    [savedCustomers, selectedCustomerId]
  );

  const [showForm, setShowForm] = useState(false);

  const handleCreateNew = async () => {
    try {
      const nextNumber = await fetchNextInvoiceNumber();
      setFormData({
        invoiceNumber: nextNumber,
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        phone: '',
        address: '',
        email: '',
        discountPercent: 0,
        items: [{ id: 1, name: '', qty: 0, price: 0, gstPercent: 0 }]
      });
      onSelectCustomer('');
      setShowForm(true);
      setStatusMessage({ type: 'info', message: 'New invoice initialized with sequential numbering.' });
    } catch (error) {
      console.error('Failed to get next invoice number:', error);
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      setFormData({
        invoiceNumber: `${dateStr}-1`,
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        phone: '',
        address: '',
        email: '',
        discountPercent: 0,
        items: [{ id: 1, name: '', qty: 0, price: 0, gstPercent: 0 }]
      });
      onSelectCustomer('');
      setShowForm(true);
    }
  };

  useEffect(() => {
    // We don't auto-generate on mount anymore, we wait for "Create New"
  }, []);

  useEffect(() => {
    if (!activeCustomer) return;
    setFormData((prev) => ({
      ...prev,
      customerName: activeCustomer.customerName || '',
      email: activeCustomer.email || '',
      phone: activeCustomer.phone || '',
      address: activeCustomer.address || ''
    }));
  }, [activeCustomer]);

  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      const qty = Number(item.qty || 0) > 0 ? Number(item.qty) : 1;
      return sum + qty * Number(item.price || 0);
    }, 0);

    const totalGst = formData.items.reduce((sum, item) => {
      const qty = Number(item.qty || 0) > 0 ? Number(item.qty) : 1;
      const base = qty * Number(item.price || 0);
      return sum + (base * Number(item.gstPercent || 0)) / 100;
    }, 0);

    const discountPercent = Number(formData.discountPercent || 0);
    const discountAmount = (subtotal * discountPercent) / 100;
    const grandTotal = subtotal + totalGst - discountAmount;

    setTotals({
      subtotal,
      discountAmount,
      grandTotal
    });
  }, [formData.items, formData.discountPercent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setItems = (newItems) => {
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleAddDiscount = () => {
    setShowDiscountControl(true);
    setFormData((prev) => ({
      ...prev,
      discountPercent: Number(prev.discountPercent || 0) > 0 ? prev.discountPercent : 5
    }));
  };

  const isFormValid = () => {
    return (
      formData.invoiceNumber &&
      formData.customerName &&
      formData.items.every((item) => {
        const gstValid = Number(item.gstPercent || 0) >= 0;
        return item.name && gstValid;
      })
    );
  };

  const [isFilenameModalOpen, setIsFilenameModalOpen] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const handleDownloadClick = (e) => {
    if (e) e.preventDefault();
    console.log('Download clicked', { isFormValid: isFormValid(), formData });
    
    if (!isFormValid()) {
      setStatusMessage({ type: 'error', message: 'Please complete all customer and item details before downloading.' });
      return;
    }
    
    // Set a default filename based on invoice number
    // Set a default filename based on invoice number and customer name
    const safeInvoiceNumber = (formData.invoiceNumber || 'INV').replace(/[/\\?%*:|"<>]/g, '_');
    const safeCustomerName = (formData.customerName || 'Customer').replace(/\s+/g, '_').replace(/[/\\?%*:|"<>]/g, '_');
    setCustomFileName(`${safeInvoiceNumber}-${safeCustomerName}`);
    setIsFilenameModalOpen(true);
  };

  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleConfirmDownload = async () => {
    if (!customFileName.trim() || isLoading) return;
    
    // Switch to step 1
    setIsLoading(true);
    setDownloadProgress(10);
    setStatusMessage({ type: 'info', message: 'Step 1/3: Preparing invoice data...' });

    try {
      // Simulate progress for better UX
      const progressTimer = setInterval(() => {
        setDownloadProgress(prev => (prev < 90 ? prev + 5 : prev));
      }, 500);

      const response = await downloadInvoice({
        ...formData,
        customFileName: customFileName.trim(),
        companyAddress: companyDetails.address || '',
        companyStreet: companyDetails.street || '',
        companyCity: companyDetails.city || '',
        companyPin: companyDetails.pin || '',
        companyPhone: companyDetails.phone || '',
        companyEmail: companyDetails.email || '',
        companyWebsite: companyDetails.website || '',
        companyGst: companyDetails.gstNumber || '',
        companyMerchant: companyDetails.merchantName || '',
        companyAccount: companyDetails.accountNumber || '',
        companyIfsc: companyDetails.ifsc || '',
        qrCode: qrCode || companyDetails.qrCode
      });
      
      clearInterval(progressTimer);
      setDownloadProgress(100);
      setStatusMessage({ type: 'success', message: 'Step 3/3: PDF Generated! Download started.' });
      
      // Close modal after a short delay
      setTimeout(() => {
        setIsFilenameModalOpen(false);
        setDownloadProgress(0);
      }, 800);

    } catch (error) {
      console.error('Download failed:', error);
      setStatusMessage({ type: 'error', message: `Generation failed: ${error.message}` });
      setIsFilenameModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddToDrive = () => {
    setStatusMessage({ type: 'info', message: 'Add to Drive integration will be available soon.' });
  };

  const handlePdfPreview = () => {
    if (!isFormValid()) {
      setStatusMessage({ type: 'error', message: 'Please complete all customer and item details for preview.' });
      return;
    }
    setIsPreviewModalOpen(true);
    setStatusMessage({ type: 'success', message: 'Showing preview...' });
  };

  if (!showForm) {
    return (
      <div className="splash-container animate-fade-in" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '100px 20px',
        background: 'white',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'var(--accent-soft)', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--accent)',
          marginBottom: '24px'
        }}>
          <FileText size={40} />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', color: 'var(--primary)', textAlign: 'center' }}>Create New Invoice</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center', maxWidth: '440px', lineHeight: '1.6' }}>
          Start a professional invoice session. Our system will automatically track sequential numbering and securely store your data.
        </p>
        <button 
          onClick={handleCreateNew}
          className="btn btn-primary"
          style={{ padding: '16px 40px', fontSize: '1.125rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
        >
          <Plus size={20} />
          Start New Invoice
        </button>
      </div>
    );
  }

  return (
    <div className="invoice-form-container animate-fade-in">
      <form onSubmit={handleDownloadClick} className="modern-form">
        <div className={`status-banner ${statusMessage.type === 'success' ? 'status-success' : statusMessage.type === 'error' ? 'status-error' : 'status-info'}`} aria-live="polite" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={18} />
            <span>{statusMessage.message}</span>
          </div>
          <button 
            type="button" 
            onClick={handleCreateNew}
            className="btn btn-dark" 
            style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Create New
          </button>
        </div>

        {/* Action Bars removed as per request */}

        <div className="form-main-grid">
          {/* Row 1: Forms Side-by-Side */}
          <div className="top-row-forms">
            <div className="card customer-card">
              <div className="customer-info-grid" style={{ paddingTop: '1rem' }}>
                <div className="form-group grid-span-full">
                  <label>Select Saved Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => onSelectCustomer(e.target.value)}
                    className="select-field"
                  >
                    <option value="">New Customer...</option>
                    {savedCustomers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.customerName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group grid-span-full">
                  <label>Name</label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="form-group grid-span-full">
                  <label>Address</label>
                  <textarea name="address" rows="2" value={formData.address} onChange={handleChange}></textarea>
                </div>
              </div>
            </div>

            <div className="items-card" style={{ padding: '0 1.5rem', background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <ItemList 
                items={formData.items} 
                setItems={setItems} 
                onAddDiscount={handleAddDiscount} 
                onQrUpload={onQrUpload} 
                qrCode={qrCode || companyDetails.qrCode}
                savedProducts={savedProducts}
                navigateTo={navigateTo}
              />
              
              {showDiscountControl && (
                <div className="discount-control animate-fade-in">
                  <label>Discount (%)</label>
                  <div className="discount-inputs">
                    <select name="discountPercent" value={Number(formData.discountPercent || 0)} onChange={handleChange} className="discount-select">
                      {DISCOUNT_PRESETS.map((p) => (<option key={p} value={p}>{p}%</option>))}
                    </select>
                    <input 
                      type="text" 
                      name="discountPercent" 
                      inputMode="decimal"
                      value={formData.discountPercent === 0 ? '' : formData.discountPercent} 
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = val.split('.');
                        if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                        if (parseFloat(val) > 100) val = '100';
                        setFormData(prev => ({ ...prev, discountPercent: val }));
                      }} 
                      className="discount-input" 
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              <div className="totals-summary">
                <div className="summary-row">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-value">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="summary-row discount">
                  <span className="summary-label">Discount ({Number(formData.discountPercent || 0)}%)</span>
                  <span className="summary-value">- ₹{totals.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="summary-row grand-total">
                  <span className="summary-label">Grand Total</span>
                  <span className="summary-value">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="summary-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={handlePdfPreview} className="btn btn-secondary" style={{ flex: 1, padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem' }}>
                    <Eye size={20} />
                    Preview
                  </button>
                  <button type="button" onClick={handleDownloadClick} disabled={isLoading} className="btn btn-primary" style={{ flex: 2, padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem' }}>
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                    {isLoading ? 'Generating PDF...' : 'Download Invoice'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Preview & Actions */}
          <div className="bottom-row-preview">
            <div className="preview-wrapper card">
              <div className="preview-header-bar">
                <div className="preview-title">DOCUMENT PREVIEW</div>
              </div>
              <InvoicePreview
                data={{
                  ...formData,
                  companyAddress: companyDetails.address || '',
                  companyStreet: companyDetails.street || '',
                  companyCity: companyDetails.city || '',
                  companyPin: companyDetails.pin || '',
                  companyPhone: companyDetails.phone || '',
                  companyEmail: companyDetails.email || '',
                  companyWebsite: companyDetails.website || '',
                  companyGst: companyDetails.gstNumber || '',
                  companyMerchant: companyDetails.merchantName || '',
                  companyAccount: companyDetails.accountNumber || '',
                  companyIfsc: companyDetails.ifsc || '',
                   qrCode: qrCode || companyDetails.qrCode
                }}
                embedded
              />
            </div>
          </div>
        </div>
      </form>

      <style jsx>{`
        .form-main-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .top-row-forms {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: stretch;
        }

        .customer-card {
          width: 100%;
        }

        .items-card {
          width: 100%;
          padding: 0 !important;
        }

        .customer-card, .items-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .customer-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .grid-span-full {
          grid-column: 1 / -1;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .header-icon {
          width: 40px;
          height: 40px;
          background: var(--accent-soft);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .invoice-badge {
          margin-left: auto;
          text-align: right;
        }

        .invoice-badge .info-label {
          font-size: 0.6rem;
          color: var(--text-muted);
          display: block;
        }

        .invoice-badge .info-value {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .totals-summary {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .summary-row.discount {
          color: var(--error);
        }

        .summary-row.grand-total {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 2px solid var(--border);
          color: var(--primary);
          font-size: 1.5rem;
          font-weight: 800;
        }

        .preview-wrapper {
          padding: 0;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }

        .preview-header-bar {
          padding: 0.75rem 1.25rem;
          background: #111827; /* Dark black/slate */
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1f2937;
        }

        .preview-title {
          color: #94a3b8;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .btn-icon-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #1f2937;
          border: 1px solid #374151;
          color: #e5e7eb;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon-label:hover:not(:disabled) {
          background: #374151;
          color: white;
        }

        .btn-icon-label:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-download-main {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #3b82f6; /* Modern blue */
          border: none;
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }

        .btn-download-main:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .hidden {
          display: none;
        }


        @media (max-width: 1024px) {
          .top-row-forms {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .invoice-form-container {
            padding: 0.5rem;
          }

          .form-group label {
            font-size: 0.75rem;
          }

          .form-group input, .form-group select, .form-group textarea {
            padding: 0.6rem;
            font-size: 0.8rem;
          }

          .summary-actions button {
            padding: 0.75rem !important;
            font-size: 0.85rem !important;
          }

          .summary-row {
            font-size: 0.8rem;
          }

          .summary-row.grand-total {
            font-size: 1.2rem;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .filename-modal {
          width: 90%;
          max-width: 400px;
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--primary);
        }

        .modal-header p {
          margin: 0.5rem 0 0;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-cancel {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--border);
          background: white;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-confirm {
          flex: 2;
          padding: 0.75rem;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-confirm:hover {
          background: var(--primary);
        }

        .progress-container {
          margin-top: 1.5rem;
        }

        .progress-track {
          width: 100%;
          height: 6px;
          background: #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent);
          transition: width 0.3s ease-out;
        }

        .progress-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-align: center;
        }
      `}</style>

      {/* Filename Modal */}
      {isFilenameModalOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="filename-modal">
            <div className="modal-header">
              <h3>Save Invoice As</h3>
              <p>Please enter a name for your PDF file</p>
            </div>
            
            <div className="form-group">
              <label>File Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={customFileName} 
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="e.g. Invoice_CustomerName"
                  autoFocus
                  disabled={isLoading}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#94a3b8' }}>.pdf</span>
              </div>
            </div>

            {isLoading && (
              <div className="progress-container animate-fade-in">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${downloadProgress}%` }}></div>
                </div>
                <div className="progress-text">
                  {downloadProgress < 40 ? 'Preparing data...' : 
                   downloadProgress < 80 ? 'Generating professional PDF...' : 
                   'Finalizing download...'}
                </div>
              </div>
            )}

            {!isLoading && (
              <div className="modal-footer">
                <button type="button" onClick={() => setIsFilenameModalOpen(false)} className="btn-cancel" disabled={isLoading}>Cancel</button>
                <button 
                  type="button" 
                  onClick={handleConfirmDownload} 
                  className="btn-confirm"
                  disabled={!customFileName.trim() || isLoading}
                >
                  Confirm Download
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {isPreviewModalOpen && (
        <InvoicePreview 
          onClose={() => setIsPreviewModalOpen(false)}
          data={{
            ...formData,
            companyAddress: companyDetails.address || '',
            companyStreet: companyDetails.street || '',
            companyCity: companyDetails.city || '',
            companyPin: companyDetails.pin || '',
            companyPhone: companyDetails.phone || '',
            companyEmail: companyDetails.email || '',
            companyWebsite: companyDetails.website || '',
            companyGst: companyDetails.gstNumber || '',
            companyMerchant: companyDetails.merchantName || '',
            companyAccount: companyDetails.accountNumber || '',
            companyIfsc: companyDetails.ifsc || '',
            qrCode: qrCode || companyDetails.qrCode
          }}
        />
      )}
    </div>
  );
};

export default InvoiceForm;
