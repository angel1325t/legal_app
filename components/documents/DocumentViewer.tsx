import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Download, FileText, File } from 'lucide-react-native';
import documentService, { DocumentPreview } from '../../services/documentService';
import { Paths, File as ExpoFile } from 'expo-file-system'; // ← Modern API
import * as Sharing from 'expo-sharing';

interface DocumentViewerProps {
  documentId: number;
  documentName: string;
  visible: boolean;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  documentName,
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useState<DocumentPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    if (visible && documentId) {
      loadPreview();
    }
  }, [visible, documentId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentService.previewDocument(documentId);

      if (response.success) {
        setPreview(response.document);
      } else {
        setError('No se pudo cargar la vista previa');
      }
    } catch (err) {
      console.error('Error loading preview:', err);
      setError('Error al cargar el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      if (!preview) return;

      const base64Data = preview.data;

      // Convert base64 → binary (Uint8Array)
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Modern API: create File in document directory
      const file = new ExpoFile(Paths.document, documentName);

      // Optional: ensure parent exists / clean up if needed (usually not required)
      // await file.parent?.create({ intermediates: true }); // if you want to be extra safe

      // Write binary data
      await file.write(bytes);

      const fileUri = file.uri;

      // Share / "download" via system share sheet
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: preview.mimetype,
          dialogTitle: 'Guardar documento',
          UTI: preview.mimetype, // iOS hint
        });
      } else {
        alert('Descarga completada (compartir no disponible)');
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Error al descargar el documento');
    } finally {
      setDownloading(false);
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Cargando vista previa...</Text>
        </View>
      );
    }

    if (error || !preview) {
      return (
        <View className="items-center justify-center flex-1 p-6">
          <File size={64} color="#9ca3af" />
          <Text className="mt-4 text-center text-gray-600">
            {error || 'No se pudo cargar la vista previa'}
          </Text>
          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading}
            className="px-6 py-3 mt-4 bg-blue-600 rounded-lg"
          >
            <Text className="font-semibold text-white">
              {downloading ? 'Descargando...' : 'Descargar documento'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Vista previa de IMÁGENES
    if (preview.file_category === 'image') {
      return (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          maximumZoomScale={3}
          minimumZoomScale={1}
        >
          <Image
            source={{ uri: `data:${preview.mimetype};base64,${preview.data}` }}
            style={{ width: width - 40, height: height - 200 }}
            resizeMode="contain"
          />
        </ScrollView>
      );
    }

    // Vista previa de PDF
    if (preview.file_category === 'pdf') {
      return (
        <View className="items-center justify-center flex-1 p-6">
          <FileText size={64} color="#ef4444" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">
            Documento PDF
          </Text>
          <Text className="mt-2 text-center text-gray-600">{documentName}</Text>
          <Text className="mt-4 text-sm text-center text-gray-500">
            La vista previa de PDFs no está disponible en la app móvil.  
            Descarga el documento para verlo.
          </Text>
          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading}
            className="px-6 py-3 mt-6 bg-blue-600 rounded-lg"
          >
            <Text className="font-semibold text-white">
              {downloading ? 'Descargando...' : 'Descargar PDF'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Vista previa de WORD
    if (preview.file_category === 'word') {
      return (
        <View className="items-center justify-center flex-1 p-6">
          <FileText size={64} color="#2b5797" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">
            Documento Word
          </Text>
          <Text className="mt-2 text-center text-gray-600">{documentName}</Text>
          <Text className="mt-4 text-sm text-center text-gray-500">
            La vista previa de documentos Word no está disponible en la app móvil.  
            Descarga el documento para verlo.
          </Text>
          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading}
            className="px-6 py-3 mt-6 bg-blue-600 rounded-lg"
          >
            <Text className="font-semibold text-white">
              {downloading ? 'Descargando...' : 'Descargar documento'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Fallback para otros tipos
    return (
      <View className="items-center justify-center flex-1 p-6">
        <File size={64} color="#9ca3af" />
        <Text className="mt-4 text-xl font-semibold text-gray-900">Documento</Text>
        <Text className="mt-2 text-center text-gray-600">{documentName}</Text>
        <TouchableOpacity
          onPress={handleDownload}
          disabled={downloading}
          className="px-6 py-3 mt-6 bg-blue-600 rounded-lg"
        >
          <Text className="font-semibold text-white">
            {downloading ? 'Descargando...' : 'Descargar'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <View className="flex-1 pr-4">
            <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
              {documentName}
            </Text>
          </View>

          <View className="flex-row gap-2">
            {preview && (
              <TouchableOpacity
                onPress={handleDownload}
                disabled={downloading}
                className="p-2 bg-blue-100 rounded-lg"
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <Download size={20} color="#3b82f6" />
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-gray-100 rounded-lg"
            >
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1">{renderPreview()}</View>
      </View>
    </Modal>
  );
};

export default DocumentViewer;