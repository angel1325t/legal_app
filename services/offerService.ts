// CLIENT APP - services/offersService.ts

import api from './api';

export interface Offer {
  id: number;
  case_id: number;
  case_name: string;
  lawyer_id: number;
  lawyer_name: string;
  price: number;
  message: string;
  state: 'sent' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string | null;
  viewed_at: string | null;
  is_favorite: boolean;
}

export interface OfferDetail extends Offer {
  // Reuse all Offer fields
}

export interface CaseLawyer {
  id: number;
  name: string;
  email: string;
  document_id?: string;
  license_id?: string;
  average_rating: number;
  total_ratings: number;
  category?: {
    id: number;
    name: string;
  } | null;
  categories?: {
    id: number;
    name: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class OffersService {
  /**
   * Obtener todas las ofertas de un caso específico
   * @param caseId - ID del caso
   * @returns Lista de ofertas del caso
   */
  async listCaseOffers(caseId: number): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await api.get(`/api/client/cases/${caseId}/offers`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.offers,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener las ofertas',
      };
    } catch (error: any) {
      console.error('Error fetching case offers:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión al obtener ofertas',
      };
    }
  }

  /**
   * Obtener el detalle de una oferta específica
   * @param offerId - ID de la oferta
   * @returns Detalle completo de la oferta
   */
  async getOfferDetail(offerId: number): Promise<ApiResponse<OfferDetail>> {
    try {
      const response = await api.get(`/api/client/offers/${offerId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.offer,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener el detalle de la oferta',
      };
    } catch (error: any) {
      console.error('Error fetching offer detail:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión al obtener el detalle',
      };
    }
  }

  /**
   * Aceptar una oferta de un abogado
   * @param caseId - ID del caso
   * @param offerId - ID de la oferta a aceptar
   * @returns Respuesta de éxito o error
   */
  async acceptOffer(caseId: number, offerId: number): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(
        `/api/client/cases/${caseId}/offers/${offerId}/accept`
      );
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Oferta aceptada exitosamente',
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al aceptar la oferta',
      };
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión al aceptar la oferta',
      };
    }
  }

  async setOfferViewed(offerId: number, isViewed: boolean): Promise<ApiResponse<OfferDetail>> {
    try {
      const response = await api.post(`/api/client/offers/${offerId}/viewed`, {
        is_viewed: isViewed,
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.offer,
          message: response.data.message || 'Estado de visto actualizado',
        };
      }

      return {
        success: false,
        error: response.data.error || 'Error al actualizar visto/no visto',
      };
    } catch (error: any) {
      console.error('Error setting viewed state:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión al actualizar visto/no visto',
      };
    }
  }

  async setOfferFavorite(offerId: number, isFavorite: boolean): Promise<ApiResponse<OfferDetail>> {
    try {
      const response = await api.post(`/api/client/offers/${offerId}/favorite`, {
        is_favorite: isFavorite,
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.offer,
          message: response.data.message || 'Favorito actualizado',
        };
      }

      return {
        success: false,
        error: response.data.error || 'Error al actualizar favorito',
      };
    } catch (error: any) {
      console.error('Error setting favorite state:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión al actualizar favorito',
      };
    }
  }

  async listFavoriteOffers(): Promise<ApiResponse<Offer[]>> {
    try {
      const response = await api.get('/api/client/offers/favorites');

      if (response.data.success) {
        return {
          success: true,
          data: response.data.offers,
        };
      }

      return {
        success: false,
        error: response.data.error || 'Error al obtener favoritos',
      };
    } catch (error: any) {
      console.error('Error fetching favorite offers:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión al obtener favoritos',
      };
    }
  }

  /**
   * Obtener información del abogado asignado a un caso
   * @param caseId - ID del caso
   * @returns Información del abogado o null si no hay abogado asignado
   */
  async getCaseLawyer(caseId: number): Promise<ApiResponse<CaseLawyer | null>> {
    try {
      const response = await api.get(`/api/client/cases/${caseId}/lawyer`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.lawyer,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener información del abogado',
      };
    } catch (error: any) {
      console.error('Error fetching case lawyer:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión al obtener el abogado',
      };
    }
  }

  /**
   * Rechazar una oferta (helper method - se puede implementar en el backend si es necesario)
   * Por ahora, solo acepta ofertas y automáticamente rechaza las demás
   */
  // async rejectOffer(caseId: number, offerId: number): Promise<ApiResponse<null>> {
  //   // Este método se puede implementar si el backend expone un endpoint específico
  //   // Por ahora, cuando aceptas una oferta, las demás se rechazan automáticamente
  //   return {
  //     success: false,
  //     error: 'Método no implementado. Las ofertas se rechazan automáticamente al aceptar otra.',
  //   };
  // }
}

export default new OffersService();
