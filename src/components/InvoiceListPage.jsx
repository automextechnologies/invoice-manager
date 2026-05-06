import React, { useEffect, useState } from 'react';
import { fetchAllInvoices } from '../services/api';
import { FileText, RefreshCw, Loader2, Search, Eye, X, User, Calendar, MapPin, Phone, Mail } from 'lucide-react';

const InvoiceListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await fetchAllInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="invoice-list-container animate-fade-in" style={{ paddingTop: '1rem' }}>
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="list-header-bar">
          <div className="header-left-side">
            <div className="icon-badge">
              <FileText size={18} />
            </div>
            <h2 className="page-title">Invoice Records</h2>
          </div>

          <div className="header-actions-side">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={loadInvoices} className="btn-icon-only" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            </button>
          </div>
        </div>

        <div className="table-responsive hide-scrollbar">
          <table className="records-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th className="text-right">Amount</th>
                <th>Date</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Loading...</span>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">No records found.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="record-row">
                    <td className="inv-num">{inv.invoiceNumber}</td>
                    <td className="inv-customer">
                      <div className="name">{inv.customerName}</div>
                    </td>
                    <td className="inv-total text-right">
                      ₹{Number(inv.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="inv-date">{inv.date}</td>
                    <td className="text-center">
                      <button 
                        className="btn-view" 
                        onClick={() => setSelectedInvoice(inv)}
                        title="View Details"
                      >
                        <Eye size={16} /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content full-detail-modal">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="icon-badge"><FileText size={18} /></div>
                <div>
                  <h3 style={{ margin: 0 }}>Invoice {selectedInvoice.invoiceNumber}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Details and item breakdown</div>
                </div>
              </div>
              <button className="close-modal" onClick={() => setSelectedInvoice(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body custom-scrollbar">
              <div className="detail-section">
                <h4 className="detail-title">Customer Information</h4>
                <div className="customer-info-grid">
                  <div className="info-block">
                    <User size={14} /> <strong>Name:</strong> {selectedInvoice.customerName}
                  </div>
                  <div className="info-block">
                    <Calendar size={14} /> <strong>Date:</strong> {selectedInvoice.date}
                  </div>
                  <div className="info-block">
                    <Phone size={14} /> <strong>Phone:</strong> {selectedInvoice.phone || '-'}
                  </div>
                  <div className="info-block">
                    <Mail size={14} /> <strong>Email:</strong> {selectedInvoice.email || '-'}
                  </div>
                  <div className="info-block full-width">
                    <MapPin size={14} /> <strong>Address:</strong> {selectedInvoice.address || '-'}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4 className="detail-title">Itemized List</h4>
                <div className="item-table-container">
                  <table className="item-detail-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th className="text-center">Qty</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">GST %</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedInvoice.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td className="text-center">{item.qty}</td>
                          <td className="text-right">₹{Number(item.price).toFixed(2)}</td>
                          <td className="text-right">{item.gstPercent}%</td>
                          <td className="text-right">₹{Number(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="detail-summary-section">
                <div className="summary-box">
                  <div className="summary-line">
                    <span>Subtotal</span>
                    <span>₹{Number(selectedInvoice.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-line highlight-blue">
                    <span>Discount ({selectedInvoice.discountPercent || 0}%)</span>
                    <span>-₹{Number(selectedInvoice.discountAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-line">
                    <span>GST Total</span>
                    <span>₹{Number(selectedInvoice.totalGst || 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-line grand-total-line">
                    <span>Grand Total</span>
                    <span>₹{Number(selectedInvoice.grandTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .list-header-bar {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          background: #fff;
        }

        .header-left-side { display: flex; align-items: center; gap: 0.75rem; }
        .icon-badge { background: var(--accent-soft); color: var(--accent); padding: 6px; border-radius: 8px; }
        .page-title { margin: 0; font-size: 1.1rem; fontWeight: 800; }

        .header-actions-side { display: flex; gap: 0.5rem; align-items: center; }
        .search-box { position: relative; }
        .search-box input { padding: 0.4rem 0.75rem 0.4rem 2rem; font-size: 0.8rem; border-radius: 8px; border: 1px solid var(--border); width: 180px; }
        .search-icon { position: absolute; left: 0.6rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

        .btn-icon-only { background: var(--background); border: 1px solid var(--border); padding: 0.4rem; border-radius: 8px; cursor: pointer; color: var(--text-muted); }
        .btn-icon-only:hover { background: var(--accent-soft); color: var(--accent); }

        .records-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .records-table th { text-align: left; padding: 0.75rem 1rem; background: #f8fafc; color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
        .record-row { border-bottom: 1px solid #f1f5f9; transition: all 0.2s; }
        .record-row:hover { background: #f8fafc; }
        .record-row td { padding: 0.75rem 1rem; }
        .inv-num { font-weight: 700; color: var(--primary); }
        .inv-customer .name { font-weight: 600; }
        .inv-total { font-weight: 700; color: var(--accent); }
        
        .btn-view {
          background: var(--accent-soft);
          color: var(--accent);
          border: none;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
        }
        .btn-view:hover { background: var(--accent); color: white; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1rem; }
        .full-detail-modal { background: white; width: 100%; max-width: 800px; max-height: 90vh; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-2xl); }
        .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .close-modal { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 50%; }
        .close-modal:hover { background: #f1f5f9; color: var(--primary); }
        
        .modal-body { flex: 1; overflow-y: auto; padding: 1.5rem; }
        .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }

        .detail-section { margin-bottom: 2rem; }
        .detail-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--accent-soft); }
        
        .customer-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .info-block { font-size: 0.875rem; color: #444; display: flex; align-items: center; gap: 0.75rem; }
        .info-block strong { color: var(--primary); width: 60px; flex-shrink: 0; }
        .full-width { grid-column: span 2; }

        .item-table-container { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .item-detail-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .item-detail-table th { background: #f8fafc; padding: 0.75rem 1rem; text-align: left; color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; }
        .item-detail-table td { padding: 0.75rem 1rem; border-top: 1px solid var(--border); }

        .detail-summary-section { display: flex; justify-content: flex-end; }
        .summary-box { width: 250px; background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid var(--border); }
        .summary-line { display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.5rem; color: #444; }
        .highlight-blue { color: var(--accent); font-weight: 600; }
        .grand-total-line { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 2px solid var(--border); font-weight: 800; font-size: 1rem; color: var(--primary); }

        .text-right { text-align: right; }
        .text-center { text-align: center; }

        @media (max-width: 640px) {
          .records-table { min-width: 600px; }
          .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .page-title { display: none; }
          .search-box input { width: 120px; }
          .customer-info-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .summary-box { width: 100%; }
          .item-table-container { overflow-x: auto; }
          .item-detail-table { min-width: 500px; }
        }
      `}</style>
    </div>
  );
};

export default InvoiceListPage;
