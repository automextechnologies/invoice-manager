import React, { useEffect, useState } from 'react';

const CompanyDetailsPage = ({ companyDetails, onSaveCompanyDetails }) => {
  const [companyData, setCompanyData] = useState({
    address: '',
    street: '',
    city: '',
    pin: '',
    phone: '',
    email: '',
    website: '',
    gstNumber: '',
    merchantName: '',
    accountNumber: '',
    ifsc: '',
    qrCode: ''
  });
  const [statusMessage, setStatusMessage] = useState({ type: 'info', message: 'Maintain official company info used in every invoice.' });

  useEffect(() => {
    setCompanyData({
      address: companyDetails.address || '',
      street: companyDetails.street || '',
      city: companyDetails.city || '',
      pin: companyDetails.pin || '',
      phone: companyDetails.phone || '',
      email: companyDetails.email || '',
      website: companyDetails.website || '',
      gstNumber: companyDetails.gstNumber || '',
      merchantName: companyDetails.merchantName || '',
      accountNumber: companyDetails.accountNumber || '',
      ifsc: companyDetails.ifsc || '',
      qrCode: companyDetails.qrCode || ''
    });
  }, [companyDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyData((prev) => ({ ...prev, qrCode: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setStatusMessage({ type: 'info', message: 'Saving company profile...' });
      await onSaveCompanyDetails(companyData);
      setStatusMessage({ type: 'success', message: 'Company details saved successfully.' });
    } catch (error) {
      setStatusMessage({ type: 'error', message: 'Failed to save company details.' });
    }
  };

  return (
    <div className="company-page-container animate-fade-in" style={{ width: '100%' }}>
      <div className="company-details-card" style={{ paddingTop: '1rem', background: 'var(--background)', border: 'none', boxShadow: 'none' }}>
        <div className={`status-banner ${statusMessage.type === 'success' ? 'status-success' : statusMessage.type === 'error' ? 'status-error' : 'status-info'}`} aria-live="polite" style={{ marginBottom: '1.5rem' }}>
          {statusMessage.message}
        </div>

        <div className="company-form-grid">
          <div className="form-group grid-span-2">
            <label>Business Address</label>
            <input
              type="text"
              name="address"
              value={companyData.address}
              onChange={handleChange}
              placeholder="Building name / Floor / Suite"
            />
          </div>
          
          <div className="form-group">
            <label>Street / Area</label>
            <input
              type="text"
              name="street"
              value={companyData.street}
              onChange={handleChange}
              placeholder="Street name"
            />
          </div>

          <div className="form-group">
            <label>City / Region</label>
            <input
              type="text"
              name="city"
              value={companyData.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>

          <div className="form-group">
            <label>PIN / Postal Code</label>
            <input
              type="text"
              name="pin"
              value={companyData.pin}
              onChange={handleChange}
              placeholder="PIN code"
            />
          </div>

          <div className="form-group">
            <label>Contact Phone</label>
            <input
              type="text"
              name="phone"
              value={companyData.phone}
              onChange={handleChange}
              placeholder="+91 00000 00000"
            />
          </div>

          <div className="form-group">
            <label>Official Email</label>
            <input
              type="email"
              name="email"
              value={companyData.email}
              onChange={handleChange}
              placeholder="billing@company.com"
            />
          </div>

          <div className="form-group grid-span-2">
            <label>Company Website</label>
            <input
              type="text"
              name="website"
              value={companyData.website}
              onChange={handleChange}
              placeholder="www.company.com"
            />
          </div>

          <div className="form-group">
            <label>GST Number</label>
            <input
              type="text"
              name="gstNumber"
              value={companyData.gstNumber}
              onChange={handleChange}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>

          <div className="form-group">
            <label>Merchant Name</label>
            <input
              type="text"
              name="merchantName"
              value={companyData.merchantName}
              onChange={handleChange}
              placeholder="Store / Business Name"
            />
          </div>

          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={companyData.accountNumber}
              onChange={handleChange}
              placeholder="000000000000"
            />
          </div>

          <div className="form-group">
            <label>IFSC Code</label>
            <input
              type="text"
              name="ifsc"
              value={companyData.ifsc}
              onChange={handleChange}
              placeholder="SBIN0000000"
            />
          </div>

          <div className="form-group grid-span-2">
            {/* QR upload removed as per request */}
          </div>
        </div>

        <div className="page-footer-actions" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
          <button type="button" onClick={handleSave} className="btn btn-primary btn-sm">
            Update Company Info
          </button>
        </div>
      </div>

      <style jsx>{`
        .company-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.5rem;
        }

        .grid-span-2 {
          grid-column: span 2;
        }

        .qr-upload-section {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(0,0,0,0.02);
          border-radius: 8px;
          border: 1px dashed var(--border);
        }

        .qr-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .qr-preview-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .qr-preview {
          width: 80px;
          height: 80px;
          object-fit: contain;
          border: 1px solid var(--border);
          padding: 4px;
          background: white;
          border-radius: 4px;
        }

        .btn-sm {
          padding: 0.6rem 1.5rem;
          font-size: 0.875rem;
        }

        .company-details-card {
          padding: 1.5rem;
          width: 100%;
        }

        @media (max-width: 900px) {
          .company-form-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .grid-span-2 {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 600px) {
          .company-form-grid {
            grid-template-columns: 1fr;
          }
          
          .qr-controls {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyDetailsPage;
