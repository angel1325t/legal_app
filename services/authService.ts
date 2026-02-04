import api from './api';

/* ───────────────────────────── */
/* Tipos */
/* ───────────────────────────── */

export interface RegisterClientData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user_id?: number;
  partner_id?: number;
  name?: string;
  email?: string;
  is_lawyer?: boolean;
  lawyer_state?: string;
  message?: string;
}

export interface User {
  user_id: number;
  partner_id: number | null;
  name: string;
  email: string;
  login: string;
  is_lawyer: boolean;
  lawyer_state: string | null;
}

/* ───────────────────────────── */
/* Service */
/* ───────────────────────────── */

export const authService = {
  /* ───────────── Registro cliente ───────────── */
  registerClient: async (
    data: RegisterClientData
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/auth/register-client', {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      return response.data;
    } catch (error: any) {
      // 👇 si el backend respondió, devolvemos su mensaje
      if (error.response?.data) {
        return error.response.data;
      }

      // 👇 solo errores REALES de red
      throw new Error('No se pudo conectar con el servidor');
    }
  },

  /* ───────────── Login ───────────── */
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/auth/login', {
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      return response.data;
    } catch (error: any) {
      // ✅ credenciales inválidas / usuario no existe
      if (error.response?.data) {
        return error.response.data;
      }

      // ❌ error real de red
      throw new Error('No se pudo conectar con el servidor');
    }
  },

  /* ───────────── Logout ───────────── */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch (error: any) {
      throw new Error('No se pudo cerrar sesión',error);
    }
  },

  /* ───────────── Usuario actual ───────────── */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error('No se pudo obtener el usuario',error);
    }
  },
};
