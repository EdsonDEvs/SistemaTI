import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export default api

export const Settings = {
  get: () => api.get('/settings').then(r=>r.data),
  update: (data) => api.put('/settings', data).then(r=>r.data)
}

export const ServicesApi = {
  list: () => api.get('/services').then(r=>r.data),
  create: (data) => api.post('/services', data).then(r=>r.data),
  update: (id, data) => api.put(`/services/${id}`, data).then(r=>r.data),
  remove: (id) => api.delete(`/services/${id}`).then(r=>r.data)
}

export const OrdersApi = {
  list: () => api.get('/os').then(r=>r.data),
  get: (id) => api.get(`/os/${id}`).then(r=>r.data),
  create: (data) => api.post('/os', data).then(r=>r.data),
  update: (id, data) => api.put(`/os/${id}`, data).then(r=>r.data),
  setItems: (id, items) => api.put(`/os/${id}/items`, items).then(r=>r.data),
  remove: (id) => api.delete(`/os/${id}`).then(r=>r.data)
}

export const FinanceApi = {
  incomeList: () => api.get('/finance/income').then(r=>r.data),
  incomeCreate: (data) => api.post('/finance/income', data).then(r=>r.data),
  expenseList: () => api.get('/finance/expense').then(r=>r.data),
  expenseCreate: (data) => api.post('/finance/expense', data).then(r=>r.data),
  expenseUpdate: (id, data) => api.put(`/finance/expense/${id}`, data).then(r=>r.data),
  expenseDelete: (id) => api.delete(`/finance/expense/${id}`).then(r=>r.data),
  dashboard: (month) => api.get('/finance/dashboard', { params: { month } }).then(r=>r.data)
}

export const CalcApi = {
  calculate: (payload) => api.post('/calc', payload).then(r=>r.data)
}

export const TicketsApi = {
  list: () => api.get('/tickets').then(r=>r.data),
  create: (data) => api.post('/tickets', data).then(r=>r.data),
  update: (id, data) => api.put(`/tickets/${id}`, data).then(r=>r.data),
  remove: (id) => api.delete(`/tickets/${id}`).then(r=>r.data)
}

