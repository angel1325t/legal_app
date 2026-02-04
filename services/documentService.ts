import api from './api';

export interface LawyerDocument {
  id: number;
  name: string;
  type: string;
  description: string;
  size: number;
  upload_date: string;
  mimetype: string;
  file_category: 'pdf' | 'word' | 'image' | 'other';
  download_url: string;
}

export interface DocumentPreview {
  id: number;
  name: string;
  mimetype: string;
  data: string; // Base64
  file_category: 'pdf' | 'word' | 'image' | 'other';
}

class DocumentService {
  // ✅ CLIENTE obtiene documentos de un abogado por ID
  async getLawyerDocuments(
    lawyerId: number
  ): Promise<{
    success: boolean;
    documents: LawyerDocument[];
    total: number;
  }> {
    const res = await api.get(`/api/client/lawyers/${lawyerId}/documents`);
    return res.data;
  }

  // ✅ Descargar documento
  async downloadDocument(documentId: number): Promise<Blob> {
    const res = await api.get(`/api/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return res.data;
  }

  // ✅ Preview de documento (obtiene base64)
  async previewDocument(
    documentId: number
  ): Promise<{ success: boolean; document: DocumentPreview }> {
    const res = await api.get(`/api/documents/${documentId}/preview`);
    return res.data;
  }

  // ✅ Helper para descargar y guardar archivo
  downloadAndSave(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default new DocumentService();