import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'default-workspace';

const withTenantHeaders = () => ({
  headers: {
    'x-tenant-id': TENANT_ID
  }
});

export const downloadInvoice = async (data) => {
  try {
    const response = await api.post('/generate-invoice', data, {
      responseType: 'blob',
      ...withTenantHeaders()
    });

    console.log('API Response received:', response.status, response.headers['content-type']);

    // Check if the response is actually a JSON error hidden in a blob
    if (response.data.type === 'application/json') {
      const errorText = await response.data.text();
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error || 'Failed to generate invoice');
    }

    // Extract filename from header or use data from request
    const contentDisposition = response.headers['content-disposition'];
    let filename = '';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Fallback to request data if header fails or is empty
    if (!filename && data.customFileName) {
      filename = data.customFileName;
    }
    
    if (!filename) {
      filename = 'invoice.pdf';
    }

    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Safety check for filename
    if (!filename.endsWith('.pdf')) filename += '.pdf';

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Small timeout before cleanup to ensure trigger
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    return { success: true };
  } catch (error) {
    if (error.response && error.response.data instanceof Blob) {
      const text = await error.response.data.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.error || 'Server error');
      } catch (e) {
        throw new Error('Server error');
      }
    }
    console.error('API Error:', error);
    throw error;
  }
};

export const fetchCustomers = async () => {
  const response = await api.get('/customers', withTenantHeaders());
  return response.data;
};

export const createCustomer = async (payload) => {
  const response = await api.post('/customers', payload, withTenantHeaders());
  return response.data;
};

export const updateCustomer = async (id, payload) => {
  const response = await api.put(`/customers/${id}`, payload, withTenantHeaders());
  return response.data;
};

export const deleteCustomer = async (id) => {
  await api.delete(`/customers/${id}`, withTenantHeaders());
};

export const fetchProducts = async () => {
  const response = await api.get('/products', withTenantHeaders());
  return response.data;
};

export const createProduct = async (payload) => {
  const response = await api.post('/products', payload, withTenantHeaders());
  return response.data;
};

export const updateProduct = async (id, payload) => {
  const response = await api.put(`/products/${id}`, payload, withTenantHeaders());
  return response.data;
};

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`, withTenantHeaders());
};

export const fetchCompanyDetails = async () => {
  const response = await api.get('/company', withTenantHeaders());
  return response.data;
};

export const updateCompanyDetails = async (payload) => {
  const response = await api.post('/company', payload, withTenantHeaders());
  return response.data;
};

export const fetchNextInvoiceNumber = async () => {
  const response = await api.get('/next-number', withTenantHeaders());
  return response.data.invoiceNumber;
};

export const fetchAllInvoices = async () => {
  const response = await api.get('/', withTenantHeaders());
  return response.data;
};

export const getInvoiceBlob = async (data) => {
  const response = await api.post('/generate-invoice', data, {
    responseType: 'blob',
    ...withTenantHeaders()
  });

  if (response.data.type === 'application/json') {
    const errorText = await response.data.text();
    const errorJson = JSON.parse(errorText);
    throw new Error(errorJson.error || 'Failed to generate invoice');
  }

  return new Blob([response.data], { type: 'application/pdf' });
};

export default api;
