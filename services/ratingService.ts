// CLIENT APP - services/ratingService.ts
import api from './api';

export interface Rating {
  id: number;
  score: number;
  comment: string;
  case_id: number;
  case_name: string;
  client_id?: number;
  client_name?: string;
  created_at: string;
}

export interface RatingCreate {
  score: number;
  comment: string;
}

export interface RatingSummary {
  average_score: number;
  total_ratings: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  rating?: Rating;
  ratings?: Rating[];
  comments?: Rating[];
  summary?: RatingSummary;
  error?: string;
  message?: string;
  total?: number;
  total_comments?: number;
  lawyer_id?: number;
}

class RatingService {
  /**
   * Crear una calificación para un caso
   */
  async createRating(caseId: number, data: RatingCreate): Promise<ApiResponse<Rating>> {
    try {
      const response = await api.post(`/api/client/cases/${caseId}/rating`, data);
      
      if (response.data.success) {
        return {
          success: true,
          rating: response.data.rating,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al crear la calificación',
      };
    } catch (error: any) {
      console.error('Error creating rating:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener la calificación de un caso específico
   */
  async getCaseRating(caseId: number): Promise<ApiResponse<Rating | null>> {
    try {
      const response = await api.get(`/api/client/cases/${caseId}/rating`);
      
      if (response.data.success) {
        return {
          success: true,
          rating: response.data.rating || null,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener la calificación',
      };
    } catch (error: any) {
      console.error('Error getting case rating:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener los comentarios de un abogado (últimos 5 o todos)
   */
  async getLawyerComments(lawyerId: number): Promise<ApiResponse<Rating[]>> {
    try {
      const response = await api.get(`/api/client/lawyers/${lawyerId}/ratings/comments`);
      
      if (response.data.success) {
        return {
          success: true,
          comments: response.data.comments || [],
          total_comments: response.data.total_comments || 0,
          lawyer_id: response.data.lawyer_id,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener los comentarios',
      };
    } catch (error: any) {
      console.error('Error getting lawyer comments:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener el resumen de calificaciones de un abogado
   */
  async getLawyerRatingSummary(lawyerId: number): Promise<ApiResponse<RatingSummary>> {
    try {
      const response = await api.get(`/api/client/lawyers/${lawyerId}/rating/summary`);
      
      if (response.data.success) {
        return {
          success: true,
          summary: response.data.summary,
          lawyer_id: response.data.lawyer_id,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener el resumen',
      };
    } catch (error: any) {
      console.error('Error getting lawyer rating summary:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }
}

export default new RatingService();