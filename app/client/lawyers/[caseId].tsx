// CLIENT APP - app/client/lawyers/[caseId].tsx

import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import offersService, { CaseLawyer } from '../../../services/offerService';
import documentService, { LawyerDocument } from '../../../services/documentService';
import ratingService, { Rating } from '../../../services/ratingService';
import DocumentCard from '../../../components/documents/DocumentCard';
import DocumentViewer from '../../../components/documents/DocumentViewer';
import RatingComment from '../../../components/RatingComment';

export default function LawyerProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const caseId = typeof params.caseId === 'string' ? params.caseId : params.caseId?.[0];
  
  const [lawyer, setLawyer] = useState<CaseLawyer | null>(null);
  const [documents, setDocuments] = useState<LawyerDocument[]>([]);
  const [recentComments, setRecentComments] = useState<Rating[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      
      const lawyerRes = await offersService.getCaseLawyer(Number(caseId));
      
      if (lawyerRes.success && lawyerRes.data) {
        setLawyer(lawyerRes.data);
        await Promise.all([
          loadLawyerDocuments(lawyerRes.data.id),
          loadLawyerComments(lawyerRes.data.id),
        ]);
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

  const loadLawyerComments = async (lawyerId: number) => {
    try {
      setLoadingComments(true);
      const response = await ratingService.getLawyerComments(lawyerId);
      
      if (response.success && response.comments) {
        setTotalComments(response.total_comments || 0);
        // Tomar solo los últimos 5 comentarios
        setRecentComments(response.comments.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading lawyer comments:', err);
    } finally {
      setLoadingComments(false);
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

  const handleViewAllComments = () => {
    if (!lawyer) return;
    router.push({
      pathname: '/client/lawyers/comments/[lawyerId]',
      params: { 
        lawyerId: lawyer.id,
        lawyerName: lawyer.name,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-sm text-gray-600">Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lawyer) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1 p-6">
          <View className="items-center p-8 bg-white rounded-2xl">
            <View className="items-center justify-center w-16 h-16 bg-red-50 rounded-xl">
              <Ionicons name="alert-circle" size={32} color="#DC2626" />
            </View>
            <Text className="mt-4 text-base font-semibold text-gray-900">
              {error || 'No se encontró información del abogado'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center justify-center w-10 h-10 bg-gray-100 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            Perfil del Abogado
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* INFORMACIÓN BÁSICA */}
        <View className="p-5 mb-4 bg-white rounded-xl">
          <View className="flex-row items-start mb-4">
            <View className="items-center justify-center mr-4 bg-indigo-100 w-14 h-14 rounded-xl">
              <Ionicons name="person" size={28} color="#4F46E5" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">{lawyer.name}</Text>
              <Text className="mt-1 text-sm text-gray-600">{lawyer.email}</Text>
            </View>
          </View>
          
          {/* Rating */}
          <View className="p-4 mt-3 bg-amber-50 rounded-xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text className="ml-2 text-2xl font-bold text-amber-900">
                  {lawyer.average_rating.toFixed(1)}
                </Text>
              </View>
              <Text className="text-sm font-medium text-amber-700">
                {lawyer.total_ratings} valoraciones
              </Text>
            </View>
          </View>
        </View>

        {/* CREDENCIALES */}
        <View className="mb-4">
          <Text className="px-1 mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Credenciales
          </Text>
          
          {lawyer.document_id && (
            <View className="p-4 mb-2 bg-white rounded-xl">
              <View className="flex-row items-center">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-lg bg-blue-50">
                  <Ionicons name="card-outline" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-500">Documento de Identidad</Text>
                  <Text className="mt-0.5 text-sm font-semibold text-gray-900">
                    {lawyer.document_id}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {lawyer.license_id && (
            <View className="p-4 mb-2 bg-white rounded-xl">
              <View className="flex-row items-center">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-lg bg-green-50">
                  <Ionicons name="school-outline" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-500">Licencia Profesional</Text>
                  <Text className="mt-0.5 text-sm font-semibold text-gray-900">
                    {lawyer.license_id}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {lawyer.categories && lawyer.categories.length > 0 && (
            <View className="p-4 bg-white rounded-xl">
              <View className="flex-row items-center mb-3">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-lg bg-indigo-50">
                  <Ionicons name="briefcase-outline" size={20} color="#4F46E5" />
                </View>
                <Text className="text-xs font-medium text-gray-500">Especialidades</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {lawyer.categories.map((cat) => (
                  <View 
                    key={cat.id}
                    className="px-3 py-1.5 bg-indigo-50 rounded-lg"
                  >
                    <Text className="text-xs font-semibold text-indigo-700">{cat.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* DOCUMENTOS ADJUNTOS */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between px-1 mb-3">
            <Text className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Documentos Adjuntos
            </Text>
            {documents.length > 0 && (
              <View className="px-2 py-1 bg-purple-100 rounded-md">
                <Text className="text-xs font-bold text-purple-700">
                  {documents.length}
                </Text>
              </View>
            )}
          </View>

          {loadingDocuments ? (
            <View className="items-center p-6 bg-white rounded-xl">
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text className="mt-2 text-xs text-gray-600">Cargando documentos...</Text>
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
            <View className="p-6 bg-gray-50 rounded-xl">
              <View className="items-center">
                <Ionicons name="folder-open-outline" size={32} color="#9CA3AF" />
                <Text className="mt-2 text-sm font-medium text-gray-700">
                  Sin documentos
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* VALORACIONES RECIENTES */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between px-1 mb-3">
            <Text className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Valoraciones Recientes
            </Text>
            {totalComments > 5 && (
              <TouchableOpacity 
                onPress={handleViewAllComments}
                className="flex-row items-center"
              >
                <Text className="mr-1 text-xs font-semibold text-indigo-600">
                  Ver todas ({totalComments})
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
              </TouchableOpacity>
            )}
          </View>

          {loadingComments ? (
            <View className="items-center p-6 bg-white rounded-xl">
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text className="mt-2 text-xs text-gray-600">Cargando valoraciones...</Text>
            </View>
          ) : recentComments.length > 0 ? (
            <>
              {recentComments.map((comment) => (
                <RatingComment key={comment.id} rating={comment} />
              ))}
              {totalComments > 5 && (
                <TouchableOpacity
                  onPress={handleViewAllComments}
                  className="flex-row items-center justify-center p-4 mt-2 bg-indigo-50 rounded-xl"
                >
                  <Text className="mr-2 text-sm font-semibold text-indigo-700">
                    Ver todas las valoraciones
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View className="p-6 bg-gray-50 rounded-xl">
              <View className="items-center">
                <Ionicons name="chatbubbles-outline" size={32} color="#9CA3AF" />
                <Text className="mt-2 text-sm font-medium text-gray-700">
                  Sin valoraciones
                </Text>
              </View>
            </View>
          )}
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
    </SafeAreaView>
  );
}