import React, { useEffect, useState } from 'react'
import InvoiceForm from './components/InvoiceForm'
import CustomerDetailsPage from './components/CustomerDetailsPage'
import ProductDetailsPage from './components/ProductDetailsPage'
import CompanyDetailsPage from './components/CompanyDetailsPage'
import InvoiceListPage from './components/InvoiceListPage'
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
  deleteProduct
} from './services/api'
import { Menu, X, FileText, Users, Building, ClipboardList, LogOut, Package } from 'lucide-react'

const COMPANY_STORAGE_KEY = 'automex_company_details'

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
  const [selectedProductId, setSelectedProductId] = useState('')
  const [customerApiEnabled, setCustomerApiEnabled] = useState(true)
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
    const storedCompany = localStorage.getItem(COMPANY_STORAGE_KEY)

    if (storedCompany) {
      setCompanyDetails(JSON.parse(storedCompany))
    }

    if (window.location.pathname === '/') {
      window.history.replaceState({}, '', '/invoice')
      setActivePath('/invoice')
    }
  }, [])

  useEffect(() => {
    const handleLocationChange = () => {
      setActivePath(window.location.pathname || '/invoice')
    }

    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customers, company, products] = await Promise.all([
          fetchCustomers(),
          fetchCompanyDetails(),
          fetchProducts()
        ])

        const normalizedCustomers = customers.map((customer) => ({
          id: customer._id,
          customerName: customer.customerName,
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || ''
        }))

        setSavedCustomers(normalizedCustomers)

        const normalizedProducts = products.map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price,
          gstPercent: p.gstPercent
        }))
        setSavedProducts(normalizedProducts)
        
        if (company && Object.keys(company).length > 0) {
          setCompanyDetails({
            address: company.address || '',
            street: company.street || '',
            city: company.city || '',
            pin: company.pin || '',
            phone: company.phone || '',
            email: company.email || '',
            website: company.website || '',
            gstNumber: company.gstNumber || '',
            merchantName: company.merchantName || '',
            accountNumber: company.accountNumber || '',
            ifsc: company.ifsc || ''
          })
        }
      } catch (error) {
        setCustomerApiEnabled(false)
        console.error('Data loading error:', error);
        console.warn('Backend API unavailable. Using browser memory.');
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(companyDetails))
  }, [companyDetails])

  const handleSaveCustomer = async (customer) => {
    if (customerApiEnabled) {
      const payload = {
        customerName: customer.customerName,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || ''
      }

      try {
        if (customer.id) {
          const updated = await updateCustomer(customer.id, payload)
          setSavedCustomers((prev) =>
            prev.map((item) => (item.id === customer.id ? {
              id: updated._id,
              customerName: updated.customerName,
              email: updated.email || '',
              phone: updated.phone || '',
              address: updated.address || ''
            } : item))
          )
          setSelectedCustomerId(updated._id)
          return
        }

        const created = await createCustomer(payload)
        setSavedCustomers((prev) => [
          ...prev,
          {
            id: created._id,
            customerName: created.customerName,
            email: created.email || '',
            phone: created.phone || '',
            address: created.address || ''
          }
        ])
        setSelectedCustomerId(created._id)
        return
      } catch (error) {
        console.warn('Unable to save customer in API. Falling back to browser memory.');
        setCustomerApiEnabled(false);
        // Still save locally as fallback, but re-throw to notify UI if needed
        // Or actually, let's re-throw so handleSave in component shows error
        throw error;
      }
    }

    const fallbackId = customer.id || String(Date.now())
    setSavedCustomers((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === fallbackId)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...customer, id: fallbackId }
        return updated
      }
      return [...prev, { ...customer, id: fallbackId }]
    })
    setSelectedCustomerId(fallbackId)
  }

  const handleDeleteCustomer = async (customerId) => {
    if (customerApiEnabled) {
      try {
        await deleteCustomer(customerId)
      } catch (error) {
        console.warn('Unable to delete customer from API. Falling back to browser memory.');
        setCustomerApiEnabled(false)
      }
    }

    setSavedCustomers((prev) => prev.filter((item) => item.id !== customerId))
    setSelectedCustomerId((prev) => (prev === customerId ? '' : prev))
  }

  const handleSaveProduct = async (product) => {
    if (customerApiEnabled) {
      const payload = {
        name: product.name,
        price: Number(product.price),
        gstPercent: Number(product.gstPercent)
      }

      try {
        if (product.id) {
          const updated = await updateProduct(product.id, payload)
          setSavedProducts((prev) =>
            prev.map((item) => (item.id === product.id ? {
              id: updated._id,
              name: updated.name,
              price: updated.price,
              gstPercent: updated.gstPercent
            } : item))
          )
          setSelectedProductId(updated._id)
          return
        }

        const created = await createProduct(payload)
        setSavedProducts((prev) => [
          ...prev,
          {
            id: created._id,
            name: created.name,
            price: created.price,
            gstPercent: created.gstPercent
          }
        ])
        setSelectedProductId(created._id)
        return
      } catch (error) {
        console.error('Failed to save product:', error)
        throw error
      }
    }

    const fallbackId = product.id || String(Date.now())
    setSavedProducts((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === fallbackId)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...product, id: fallbackId }
        return updated
      }
      return [...prev, { ...product, id: fallbackId }]
    })
    setSelectedProductId(fallbackId)
  }

  const handleDeleteProduct = async (productId) => {
    if (customerApiEnabled) {
      try {
        await deleteProduct(productId)
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
    setSavedProducts((prev) => prev.filter((item) => item.id !== productId))
    setSelectedProductId((prev) => (prev === productId ? '' : prev))
  }

  const handleSaveCompanyDetails = async (details) => {
    if (customerApiEnabled) {
      try {
        const updated = await updateCompanyDetails(details)
        setCompanyDetails(updated)
        return
      } catch (error) {
        console.warn('Unable to save company details in API. Falling back to browser memory.')
      }
    }
    setCompanyDetails(details)
  }

  const navigateTo = (path) => {
    if (window.location.pathname === path) return
    window.history.pushState({}, '', path)
    setActivePath(path)
  }

  const renderActivePage = () => {
    if (activePath === '/invoices') {
      return <InvoiceListPage />
    }

    if (activePath === '/customer-details') {
      return (
        <CustomerDetailsPage
          savedCustomers={savedCustomers}
          onSaveCustomer={handleSaveCustomer}
          onDeleteCustomer={handleDeleteCustomer}
        />
      )
    }

    if (activePath === '/product-details') {
      return (
        <ProductDetailsPage
          savedProducts={savedProducts}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )
    }

    if (activePath === '/company-details') {
      return (
        <CompanyDetailsPage
          companyDetails={companyDetails}
          onSaveCompanyDetails={handleSaveCompanyDetails}
          customerApiEnabled={customerApiEnabled}
        />
      )
    }

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

  return (
    <div className={`App app-shell ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      {/* Sidebar Navigation */}
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

      {/* Main Content Area */}
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
          &copy; {new Date().getFullYear()} Automex Solutions. Powered by Next-Gen Invoicing.
        </footer>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  )
}

export default App
