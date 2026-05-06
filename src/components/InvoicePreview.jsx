import React from 'react';

const InvoicePreview = ({ data, onClose, embedded = false }) => {
  const subtotal = data.items.reduce((sum, item) => {
    const qty = Number(item.qty || 0);
    return sum + qty * Number(item.price || 0);
  }, 0);
  const totalGst = data.items.reduce((sum, item) => {
    const qty = Number(item.qty || 0);
    const base = qty * Number(item.price || 0);
    return sum + (base * Number(item.gstPercent || 0)) / 100;
  }, 0);
  const discountPercent = Number(data.discountPercent || 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = subtotal + totalGst - discountAmount;

  return (
    <div className="preview-overlay" style={{
      position: embedded ? 'relative' : 'fixed',
      top: embedded ? 'auto' : 0,
      left: embedded ? 'auto' : 0,
      width: '100%',
      height: embedded ? '100%' : '100%',
      backgroundColor: embedded ? 'transparent' : 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: embedded ? 'auto' : 1000,
      backdropFilter: embedded ? 'none' : 'blur(4px)'
    }}>
      <div className="preview-modal animate-fade-in" style={{
        width: '100%',
        maxWidth: embedded ? '100%' : '850px',
        maxHeight: embedded ? 'none' : '90vh',
        backgroundColor: 'white',
        borderRadius: embedded ? '0' : '16px',
        overflow: embedded ? 'visible' : 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: embedded ? 'none' : 'var(--shadow-lg)'
      }}>
        {!embedded && (
          <div className="preview-header" style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid var(--border)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: '#fff',
            fontFamily: "'Outfit', sans-serif"
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>INVOICE PREVIEW</h2>
            <button 
              onClick={onClose}
              className="btn btn-dark"
              style={{ padding: '8px 20px', fontSize: '0.8125rem' }}
            >
              Close
            </button>
          </div>
        )}

        <div className="preview-content hide-scrollbar mobile-preview-adjust" style={{ 
          padding: '40px', 
          overflowY: embedded ? 'visible' : 'auto',
          backgroundColor: 'white',
          color: '#1a1a1a',
          fontFamily: "'Inter', sans-serif"
        }}>
          {/* Top section: left company block, right invoice heading */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '5px solid #000', marginBottom: '30px', paddingBottom: '5px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '50%' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <img src="/automexlogoblack.png" alt="Logo" style={{ maxWidth: '140px', height: 'auto' }} />
              </div>
              <div style={{ textAlign: 'left', marginTop: '10px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{data.companyAddress || '-'}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                  {[data.companyStreet, data.companyCity, data.companyPin].filter(Boolean).join(', ') || '-'}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{data.companyWebsite || '-'}</p>
                {data.companyGst && <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>GST: {data.companyGst}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', width: '50%' }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: '42px', 
                fontWeight: '700', 
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>INVOICE</h1>
            </div>
          </div>

          {/* Info Grid: Billed to, Invoice No, Date */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.5fr 1fr 1fr', 
            gap: '20px', 
            marginBottom: '40px', 
            padding: '20px 0', 
            borderBottom: '1px solid #eee' 
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Billed to</div>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px', color: '#000' }}>{data.customerName}</div>
              <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#444' }}>{data.address}</div>
              <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#444' }}>{data.phone}</div>
              <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#444' }}>{data.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Invoice No</div>
              <div style={{ fontSize: '14px' }}>{data.invoiceNumber || 'AUTO-GEN'}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Issue Date</div>
              <div style={{ fontSize: '14px' }}>{data.date}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #3b82f6' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#fff', backgroundColor: '#1979c1', width: '45%' }}>ITEM DESCRIPTION</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#fff', backgroundColor: '#1979c1' }}>PRICE</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#fff', backgroundColor: '#1979c1' }}>QTY</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#fff', backgroundColor: '#1979c1' }}>GST %</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#fff', backgroundColor: '#1979c1' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px 8px', fontSize: '13px', fontWeight: '600' }}>{item.name}</td>
                  <td style={{ padding: '15px 8px', textAlign: 'right', fontSize: '13px' }}>₹{Number(item.price || 0).toFixed(2)}</td>
                  <td style={{ padding: '15px 8px', textAlign: 'right', fontSize: '13px' }}>{Number(item.qty || 0) > 0 ? Number(item.qty) : '0'}</td>
                  <td style={{ padding: '15px 8px', textAlign: 'right', fontSize: '13px' }}>{Number(item.gstPercent || 0).toFixed(2)}%</td>
                  <td style={{ padding: '15px 8px', textAlign: 'right', fontSize: '13px' }}>
                    ₹{((Number(item.qty || 0) * Number(item.price || 0)) * (1 + Number(item.gstPercent || 0) / 100)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <div style={{ width: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '14px' }}>
                <span style={{ fontWeight: '600' }}>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: '14px', color: '#3b82f6' }}>
                <span style={{ fontWeight: '600' }}>Discount ({discountPercent}%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '12px', 
                marginTop: '10px', 
                borderTop: '2px solid #000',
                fontSize: '16px',
                fontWeight: '700',
                backgroundColor: '#f8fafc'
              }}>
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {data.companyMerchant && (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginTop: '40px', justifyContent: 'flex-end' }}>
              {data.qrCode && (
                <div style={{ border: '1px solid #eee', padding: '6px', borderRadius: '6px' }}>
                  <img src={data.qrCode} alt="Payment QR" style={{ width: '140px', height: '140px', display: 'block' }} />
                </div>
              )}
              <div style={{ textAlign: 'left', fontSize: '13px' }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '700', color: '#000', marginBottom: '8px', fontSize: '11px', letterSpacing: '0.5px' }}>PAYMENT DETAILS</div>
                <div style={{ color: '#444', marginBottom: '4px' }}><strong>Merchant:</strong> {data.companyMerchant}</div>
                <div style={{ color: '#444', marginBottom: '4px' }}><strong>A/C:</strong> {data.companyAccount}</div>
                <div style={{ color: '#444', marginBottom: '4px' }}><strong>IFSC:</strong> {data.companyIfsc}</div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '80px', textAlign: 'center', fontSize: '11px', color: '#999' }}>
            <p>Email: {data.companyEmail || '-'} | Phone: {data.companyPhone || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
