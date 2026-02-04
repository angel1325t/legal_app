import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import offersService, { CaseLawyer } from '../../../services/offerService';
import documentService, { LawyerDocument } from '../../../services/documentService';
import DocumentCard from '../../../components/documents/DocumentCard';
import DocumentViewer from '../../../components/documents/DocumentViewer';

export default function LawyerProfileScreen() {
  const params = useLocalSearchParams();
  const caseId = typeof params.caseId === 'string' ? params.caseId : params.caseId?.[0];
  
  const [lawyer, setLawyer] = useState<CaseLawyer | null>(null);
  const [documents, setDocuments] = useState<LawyerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el visor de documentos
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<LawyerDocument | null>(null);

  useEffect(() => {
    if (caseId) {
      loadProfile();
    }
  }, [caseId]);

  const loadProfile = async () => {
    if (!caseId) {
      setError('ID de caso no válido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Obtener información del abogado asignado al caso
      const lawyerRes = await offersService.getCaseLawyer(Number(caseId));
      
      if (lawyerRes.success && lawyerRes.data) {
        setLawyer(lawyerRes.data);
        // Cargar documentos del abogado
        await loadLawyerDocuments(lawyerRes.data.id);
      } else {
        setError(lawyerRes.error || 'No se pudo cargar la información del abogado');
      }
    } catch (err) {
      setError('Error al cargar el perfil del abogado');
      console.error('Error loading lawyer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLawyerDocuments = async (lawyerId: number) => {
    try {
      setLoadingDocuments(true);
      const response = await documentService.getLawyerDocuments(lawyerId);
      
      if (response.success && response.documents) {
        setDocuments(response.documents);
      }
    } catch (err) {
      console.error('Error loading lawyer documents:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handlePreviewDocument = (document: LawyerDocument) => {
    setSelectedDocument(document);
    setViewerVisible(true);
  };

  const handleDownloadDocument = async (document: LawyerDocument) => {
    try {
      setDownloading(true);
      
      const blob = await documentService.downloadDocument(document.id);
      
      // Para React Native, usamos el componente DocumentViewer
      // que maneja la descarga internamente
      handlePreviewDocument(document);
      
    } catch (err) {
      console.error('Error downloading document:', err);
      Alert.alert(
        'Error',
        'No se pudo descargar el documento. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Cargando perfil...</Text>
      </View>
    );
  }

  if (error || !lawyer) {
    return (
      <View className="items-center justify-center flex-1 p-6 bg-gray-50">
        <Text className="text-lg font-semibold text-red-600">
          {error || 'No se encontró información del abogado'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-6">
          {/* INFORMACIÓN DEL ABOGADO */}
          <View className="p-6 bg-white shadow-sm rounded-xl">
            <Text className="text-2xl font-bold text-gray-900">{lawyer.name}</Text>
            <Text className="mt-1 text-gray-600">{lawyer.email}</Text>
            
            <View className="mt-4">
              <Text className="text-lg text-gray-700">
                ⭐ {lawyer.average_rating.toFixed(1)} 
                <Text className="text-sm text-gray-500">
                  {' '}({lawyer.total_ratings} valoraciones)
                </Text>
              </Text>
            </View>
          </View>

          {/* DOCUMENTOS PROFESIONALES */}
          <View className="mt-6">
            <Text className="mb-3 text-lg font-bold text-gray-900">
              Documentos Profesionales
            </Text>
            
            {/* Documento de Identidad */}
            {lawyer.document_id && (
              <View className="p-4 mb-3 bg-white border border-gray-200 rounded-lg">
                <Text className="font-semibold text-gray-900">
                  📄 Documento de Identidad
                </Text>
                <Text className="mt-1 text-sm text-gray-600">
                  ID: {lawyer.document_id}
                </Text>
              </View>
            )}

            {/* Licencia Profesional */}
            {lawyer.license_id && (
              <View className="p-4 mb-3 bg-white border border-gray-200 rounded-lg">
                <Text className="font-semibold text-gray-900">
                  🎓 Licencia Profesional
                </Text>
                <Text className="mt-1 text-sm text-gray-600">
                  Licencia: {lawyer.license_id}
                </Text>
              </View>
            )}

            {/* Categoría/Especialidad */}
            {lawyer.category && (
              <View className="p-4 mb-3 bg-white border border-gray-200 rounded-lg">
                <Text className="font-semibold text-gray-900">
                  ⚖️ Especialidad
                </Text>
                <Text className="mt-1 text-sm text-gray-600">
                  {lawyer.category.name}
                </Text>
              </View>
            )}

            {/* Categorías Múltiples (si aplica) */}
            {lawyer.categories && lawyer.categories.length > 0 && (
              <View className="p-4 mb-3 bg-white border border-gray-200 rounded-lg">
                <Text className="mb-2 font-semibold text-gray-900">
                  ⚖️ Especialidades
                </Text>
                {lawyer.categories.map((cat) => (
                  <View 
                    key={cat.id}
                    className="px-3 py-2 mb-2 rounded-md bg-blue-50"
                  >
                    <Text className="text-sm text-blue-900">{cat.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* DOCUMENTOS ADJUNTOS */}
          <View className="mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">
                Documentos Adjuntos
              </Text>
              {documents.length > 0 && (
                <View className="px-3 py-1 rounded-full bg-blue-50">
                  <Text className="text-sm font-medium text-blue-600">
                    {documents.length}
                  </Text>
                </View>
              )}
            </View>

            {loadingDocuments ? (
              <View className="items-center p-6 bg-white rounded-lg">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className="mt-2 text-sm text-gray-600">
                  Cargando documentos...
                </Text>
              </View>
            ) : documents.length > 0 ? (
              <>
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onPreview={handlePreviewDocument}
                    onDownload={handleDownloadDocument}
                  />
                ))}
              </>
            ) : (
              <View className="p-6 bg-white border border-gray-200 border-dashed rounded-lg">
                <Text className="text-center text-gray-500">
                  📂 No hay documentos adjuntos
                </Text>
                <Text className="mt-2 text-sm text-center text-gray-400">
                  El abogado aún no ha subido documentos de verificación
                </Text>
              </View>
            )}
          </View>

          {/* Información adicional */}
          <View className="p-4 mt-6 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
            <Text className="text-sm font-medium text-blue-900">
              💡 Información
            </Text>
            <Text className="mt-1 text-sm text-blue-800">
              Los documentos mostrados han sido proporcionados por el abogado para verificar sus credenciales profesionales.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          documentId={selectedDocument.id}
          documentName={selectedDocument.name}
          visible={viewerVisible}
          onClose={() => {
            setViewerVisible(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </>
  );
}