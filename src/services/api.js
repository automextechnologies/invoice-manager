import axios from 'axios';

// Get API URL from env or default to relative path for unified build
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add tenant ID to every request
api.interceptors.request.use((config) => {
  const tenantId = import.meta.env.VITE_TENANT_ID || 'default-workspace';
  config.headers['x-tenant-id'] = tenantId;
  return config;
});

export const fetchCustomers = async () => {
  const response = await api.get('/customers');
  return response.data;
};

export const createCustomer = async (payload) => {
  const response = await api.post('/customers', payload);
  return response.data;
};

export const updateCustomer = async (id, payload) => {
  const response = await api.put(`/customers/${id}`, payload);
  return response.data;
};

export const deleteCustomer = async (id) => {
  await api.delete(`/customers/${id}`);
};

export const fetchProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (payload) => {
  const response = await api.post('/products', payload);
  return response.data;
};

export const updateProduct = async (id, payload) => {
  const response = await api.put(`/products/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);
};

export const fetchCompanyDetails = async () => {
  const response = await api.get('/company');
  return response.data;
};

export const checkHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 3000 });
    return response.status === 200;
  } catch (e) {
    return false;
  }
};

export const updateCompanyDetails = async (payload) => {
  const response = await api.post('/company', payload);
  return response.data;
};

export const fetchNextInvoiceNumber = async () => {
  const response = await api.get('/next-number');
  return response.data.invoiceNumber;
};

export const fetchAllInvoices = async () => {
  const response = await api.get('/');
  return response.data;
};

export const downloadInvoice = async (invoiceData) => {
  try {
    const response = await api.post('/generate-invoice', invoiceData, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Use the custom filename if provided, otherwise default
    const fileName = invoiceData.customFileName ? 
      (invoiceData.customFileName.endsWith('.pdf') ? invoiceData.customFileName : `${invoiceData.customFileName}.pdf`) : 
      `invoice-${invoiceData.invoiceNumber}.pdf`;
      
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response;
  } catch (error) {
    console.error('Invoice download failed:', error);
    throw error;
  }
};

export default api;
