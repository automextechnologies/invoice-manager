import React, { useEffect, useState } from 'react'
import InvoiceForm from './components/InvoiceForm'
import CustomerDetailsPage from './components/CustomerDetailsPage'
import ProductDetailsPage from './components/ProductDetailsPage'
import CompanyDetailsPage from './components/CompanyDetailsPage'
import InvoiceListPage from './components/InvoiceListPage'
import LoadingScreen from './components/LoadingScreen'
import {
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
  fetchCompanyDetails,
  updateCompanyDetails,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  checkHealth
} from './services/api'
import { Menu, X, FileText, Users, Building, ClipboardList, LogOut, Package } from 'lucide-react'

function App() {
  const menuItems = [
    { label: 'Invoice', path: '/invoice', icon: FileText },
    { label: 'Invoice Records', path: '/invoices', icon: ClipboardList },
    { label: 'Customer Details', path: '/customer-details', icon: Users },
    { label: 'Items', path: '/product-details', icon: Package },
    { label: 'Company Details', path: '/company-details', icon: Building }
  ]
  const [activePath, setActivePath] = useState(window.location.pathname || '/invoice')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [savedCustomers, setSavedCustomers] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [savedProducts, setSavedProducts] = useState([])
  const [isBackendReady, setIsBackendReady] = useState(false)
  const [companyDetails, setCompanyDetails] = useState({
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
  })
  const [qrCode, setQrCode] = useState(null)

  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState({}, '', '/invoice')
      setActivePath('/invoice')
    }

    const handleLocationChange = () => {
      setActivePath(window.location.pathname || '/invoice')
    }

    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  const loadData = async () => {
    try {
      const [customers, company, products] = await Promise.all([
        fetchCustomers(),
        fetchCompanyDetails(),
        fetchProducts()
      ])
      
      const normalizedCustomers = (customers || []).map((customer) => ({
        id: customer._id || customer.id,
        customerName: customer.customerName,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || ''
      }))
      setSavedCustomers(normalizedCustomers)

      const normalizedProducts = (products || []).map((p) => ({
        id: p._id || p.id,
        name: p.name,
        price: p.price,
        gstPercent: p.gstPercent
      }))
      setSavedProducts(normalizedProducts)

      if (company && Object.keys(company).length > 0) {
        setCompanyDetails(company)
      }
    } catch (error) {
      console.error('Data loading error:', error)
    }
  }

  useEffect(() => {
    const verifyBackend = async () => {
      console.log('Starting backend verification...');
      let ready = false;
      let attempts = 0;
      while (!ready && attempts < 30) {
        ready = await checkHealth();
        if (!ready) {
          console.log(`Backend not ready (attempt ${attempts + 1}/30), retrying...`);
          await new Promise(r => setTimeout(r, 1000));
          attempts++;
        }
      }
      if (ready) {
        console.log('Backend connection established.');
        setIsBackendReady(true);
        loadData();
      } else {
        console.error('Failed to connect to backend after 30 attempts.');
      }
    }
    verifyBackend();
  }, [])

  const handleSaveCustomer = async (customer) => {
    const payload = {
      customerName: customer.customerName,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    }
    if (customer.id) {
      await updateCustomer(customer.id, payload)
    } else {
      await createCustomer(payload)
    }
    loadData()
  }

  const handleDeleteCustomer = async (customerId) => {
    await deleteCustomer(customerId)
    loadData()
    if (selectedCustomerId === customerId) setSelectedCustomerId('')
  }

  const handleSaveProduct = async (product) => {
    const payload = {
      name: product.name,
      price: Number(product.price),
      gstPercent: Number(product.gstPercent)
    }
    if (product.id) {
      await updateProduct(product.id, payload)
    } else {
      await createProduct(payload)
    }
    loadData()
  }

  const handleDeleteProduct = async (productId) => {
    await deleteProduct(productId)
    loadData()
  }

  const handleSaveCompanyDetails = async (details) => {
    await updateCompanyDetails(details)
    setCompanyDetails(details)
  }

  const navigateTo = (path) => {
    if (window.location.pathname === path) return
    window.history.pushState({}, '', path)
    setActivePath(path)
  }

  const renderActivePage = () => {
    switch (activePath) {
      case '/invoices':
        return <InvoiceListPage />
      case '/customer-details':
        return (
          <CustomerDetailsPage
            savedCustomers={savedCustomers}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        )
      case '/product-details':
        return (
          <ProductDetailsPage
            savedProducts={savedProducts}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )
      case '/company-details':
        return (
          <CompanyDetailsPage
            companyDetails={companyDetails}
            onSaveCompanyDetails={handleSaveCompanyDetails}
          />
        )
      default:
        return (
          <InvoiceForm
            savedCustomers={savedCustomers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            companyDetails={companyDetails}
            qrCode={qrCode}
            onQrUpload={setQrCode}
            savedProducts={savedProducts}
            navigateTo={navigateTo}
          />
        )
    }
  }

  return (
    <>
      {!isBackendReady && <LoadingScreen />}
      <div className={`App app-shell ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2 className="sidebar-brand">
              <span style={{ fontWeight: 800 }}>Automex</span>
              <span style={{ color: 'var(--accent)', fontWeight: 400 }}>PRO</span>
            </h2>
            <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((menu) => (
              <button
                key={menu.path}
                type="button"
                onClick={() => {
                  navigateTo(menu.path)
                  if (window.innerWidth <= 768) setIsSidebarOpen(false)
                }}
                className={`sidebar-link ${menu.path === activePath ? 'active' : ''}`}
              >
                {menu.icon && <menu.icon size={20} className="nav-icon" />}
                <span className="nav-label">{menu.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-link logout-btn">
              <LogOut size={20} className="nav-icon" />
              <span className="nav-label">Logout</span>
            </button>
          </div>
        </aside>

        <div className="main-layout">
          <header className="app-header">
            <div className="container header-row">
              <div className="header-left">
                <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  <Menu size={24} />
                </button>
                <div className="brand-section">
                  <h1 className="app-title">
                    <span style={{ fontWeight: 800 }}>Automex</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 400 }}>Invoice</span>
                  </h1>
                </div>
              </div>

              <div className="header-right">
                <div className="version-pill">
                  v1.2 PRO
                </div>
              </div>
            </div>
          </header>

          <main className="app-main animate-fade-in">
            <div className="container">
              <div className="content-area">
                {renderActivePage()}
              </div>
            </div>
          </main>

          <footer className="container" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '1.5rem' }}></div>
            &copy; {new Date().getFullYear()} Automex Solutions. All-in-One Fullstack Invoice System.
          </footer>
        </div>

        {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
      </div>
    </>
  )
}

export default App
