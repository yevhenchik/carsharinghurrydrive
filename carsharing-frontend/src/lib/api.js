const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Обгортка над fetch: підставляє базовий URL, JSON-заголовки,
 * JWT з localStorage (якщо є) і кидає зрозумілу помилку при 4xx/5xx.
 */
async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Помилка запиту: ${res.status}`);
  }

  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  getProfile: () => request('/auth/profile', { auth: true }),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: payload, auth: true }),

  listCars: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return request(`/cars${qs ? `?${qs}` : ''}`);
  },
  getCar: (id) => request(`/cars/${id}`),

  createBooking: (payload) => request('/booking', { method: 'POST', body: payload, auth: true }),
  listBookings: (all = false) => request(`/booking${all ? '?all=true' : ''}`, { auth: true }),
  cancelBooking: (id) => request(`/booking/${id}`, { method: 'DELETE', auth: true }),

  createPayment: (payload) => request('/payment', { method: 'POST', body: payload, auth: true }),

  listCarReviews: (carId) => request(`/reviews/car/${carId}`),
  createReview: (payload) => request('/reviews', { method: 'POST', body: payload, auth: true }),

  // Admin
  createCar: (payload) => request('/cars', { method: 'POST', body: payload, auth: true }),
  updateCar: (id, payload) => request(`/cars/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteCar: (id) => request(`/cars/${id}`, { method: 'DELETE', auth: true }),
  getStats: () => request('/admin/stats', { auth: true }),
  listUsers: () => request('/admin/users', { auth: true }),
  updateBookingStatus: (id, bookingStatus) =>
    request(`/admin/bookings/${id}/status`, { method: 'PUT', body: { bookingStatus }, auth: true }),
  deleteBooking: (id) => request(`/admin/bookings/${id}`, { method: 'DELETE', auth: true }),
};
