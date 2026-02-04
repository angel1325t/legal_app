// CLIENT APP - services/caseService.ts

import api from './api';

export interface Case {
  id: number;
  name: string;
  description: string;
  stage: string;
  categories: string[];
  client_id?: number;
  client_name?: string;
}

export interface CreateCaseData {
  name: string;
  description: string;
  category_ids: number[];
}

export interface UpdateCaseData {
  name?: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class CaseService {
  /**
   * Crear un nuevo caso
   */
  async createCase(data: CreateCaseData): Promise<ApiResponse<Case>> {
    try {
      const response = await api.post('/api/client/cases', data);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.case,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al crear el caso',
      };
    } catch (error: any) {
      console.error('Error creating case:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Listar todos los casos del cliente
   */
  async listCases(): Promise<ApiResponse<Case[]>> {
    try {
      const response = await api.get('/api/client/cases');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.cases,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener los casos',
      };
    } catch (error: any) {
      console.error('Error listing cases:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener detalles de un caso específico
   */
  async getCase(caseId: number): Promise<ApiResponse<Case>> {
    try {
      const response = await api.get(`/api/client/cases/${caseId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.case,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener el caso',
      };
    } catch (error: any) {
      console.error('Error getting case:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Actualizar un caso
   */
  async updateCase(caseId: number, data: UpdateCaseData): Promise<ApiResponse<null>> {
    try {
      const response = await api.put(`/api/client/cases/${caseId}`, data);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al actualizar el caso',
      };
    } catch (error: any) {
      console.error('Error updating case:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Cerrar un caso (marcar como ganado)
   */
  async closeCase(caseId: number): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(`/api/client/cases/${caseId}/close`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al cerrar el caso',
      };
    } catch (error: any) {
      console.error('Error closing case:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Cancelar un caso (marcar como perdido)
   */
  async cancelCase(caseId: number): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(`/api/client/cases/${caseId}/cancel`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al cancelar el caso',
      };
    } catch (error: any) {
      console.error('Error canceling case:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }
}

export default new CaseService();