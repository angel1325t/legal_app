// CLIENT APP - services/api.ts

import axios from 'axios';

// 🔧 CONFIGURACIÓN: Cambia esto por la URL de tu backend Odoo
const API_BASE_URL = 'http://192.168.0.4:8069';  // Ejemplo: http://192.168.0.7

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para manejar cookies de sesión
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para logging (útil para debug)
api.interceptors.request.use(
  (config) => {
    console.log(`📡 [CLIENT] API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ [CLIENT] Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [CLIENT] API Response: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('❌ [CLIENT] Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };