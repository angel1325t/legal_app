// CLIENT APP - services/categoryService.ts

import api from './api';

export interface LegalCategory {
  id: number;
  name: string;
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class CategoryService {
  /**
   * Obtener todas las categorías legales
   */
  async listCategories(): Promise<ApiResponse<LegalCategory[]>> {
    try {
      const response = await api.get('/api/categories');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.categories,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener las categorías',
      };
    } catch (error: any) {
      console.error('Error listing categories:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener una categoría específica
   */
  async getCategory(categoryId: number): Promise<ApiResponse<LegalCategory>> {
    try {
      const response = await api.get(`/api/categories/${categoryId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.category,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener la categoría',
      };
    } catch (error: any) {
      console.error('Error getting category:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }
}

export default new CategoryService();