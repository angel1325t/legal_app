import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import type {
  User,
  LoginData,
  RegisterClientData,
} from '../services/authService';

/* ───────────────────────────── */
/* Tipos */
/* ───────────────────────────── */

type LoginResult =
  | { status: 'ok' }
  | { status: 'blocked'; reason: 'lawyer' }
  | { status: 'invalid'; message: string };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<LoginResult>;
  registerClient: (data: RegisterClientData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ───────────────────────────── */
/* Provider */
/* ───────────────────────────── */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ───────────── Logout ───────────── */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      await AsyncStorage.removeItem('client_user');
    }
  }, []);

  /* ───────────── Verificar sesión ───────────── */
  const checkSession = useCallback(async () => {
    try {
      const savedUser = await AsyncStorage.getItem('client_user');
      if (!savedUser) return;

      const userData: User = JSON.parse(savedUser);

      if (userData.is_lawyer) {
        await AsyncStorage.removeItem('client_user');
        setUser(null);
        return;
      }

      setUser(userData);

      try {
        const freshUser = await authService.getCurrentUser();

        if (freshUser.is_lawyer) {
          await logout();
          return;
        }

        setUser(freshUser);
        await AsyncStorage.setItem(
          'client_user',
          JSON.stringify(freshUser)
        );
      } catch {
        // usar datos locales
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /* ───────────── Login ───────────── */
  const login = async (data: LoginData): Promise<LoginResult> => {
    try {
      const response = await authService.login(data);

      if (!response.success || !response.user_id) {
        return {
          status: 'invalid',
          message: response.message || 'Credenciales inválidas',
        };
      }

      if (response.is_lawyer) {
        return { status: 'blocked', reason: 'lawyer' };
      }

      const userData: User = {
        user_id: response.user_id,
        partner_id: response.partner_id || null,
        name: response.name || '',
        email: response.email || data.email,
        login: data.email,
        is_lawyer: false,
        lawyer_state: null,
      };

      setUser(userData);
      await AsyncStorage.setItem(
        'client_user',
        JSON.stringify(userData)
      );

      return { status: 'ok' };
    } catch (error: any) {
      // SOLO errores reales
      throw error;
    }
  };

  /* ───────────── Registro ───────────── */
  const registerClient = async (data: RegisterClientData) => {
    const response = await authService.registerClient(data);

    if (!response.success || !response.user_id) {
      throw new Error(response.message || 'Error al registrar cliente');
    }

    await login({ email: data.email, password: data.password });
  };

  /* ───────────── Refrescar usuario ───────────── */
  const refreshUser = async () => {
    try {
      const freshUser = await authService.getCurrentUser();

      if (freshUser.is_lawyer) {
        await logout();
        return;
      }

      setUser(freshUser);
      await AsyncStorage.setItem(
        'client_user',
        JSON.stringify(freshUser)
      );
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        registerClient,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ───────────────────────────── */
/* Hook */
/* ───────────────────────────── */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
