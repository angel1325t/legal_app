import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FileText, Image as ImageIcon, Download, Eye } from 'lucide-react-native';
import { LawyerDocument } from '../../services/documentService';

interface DocumentCardProps {
  document: LawyerDocument;
  onPreview: (doc: LawyerDocument) => void;
  onDownload: (doc: LawyerDocument) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onDownload,
}) => {
  const getDocumentIcon = () => {
    switch (document.file_category) {
      case 'pdf':
        return <FileText size={24} color="#ef4444" />;
      case 'word':
        return <FileText size={24} color="#2b5797" />;
      case 'image':
        return <ImageIcon size={24} color="#10b981" />;
      default:
        return <FileText size={24} color="#6b7280" />;
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
      year: 'numeric',
    });
  };

  return (
    <View className="p-4 mb-3 bg-white border border-gray-200 rounded-lg">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start flex-1">
          <View className="mr-3">{getDocumentIcon()}</View>
          
          <View className="flex-1">
            <Text className="font-semibold text-gray-900" numberOfLines={2}>
              {document.name}
            </Text>
            
            {document.description && (
              <Text className="mt-1 text-sm text-gray-600" numberOfLines={2}>
                {document.description}
              </Text>
            )}
            
            <View className="flex-row items-center mt-2">
              <Text className="text-xs text-gray-500">
                {formatFileSize(document.size)}
              </Text>
              <Text className="mx-2 text-xs text-gray-400">•</Text>
              <Text className="text-xs text-gray-500">
                {formatDate(document.upload_date)}
              </Text>
            </View>
            
            <View className="px-2 py-1 mt-2 rounded bg-gray-50" style={{ alignSelf: 'flex-start' }}>
              <Text className="text-xs text-gray-600">
                {document.type}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity
          onPress={() => onPreview(document)}
          className="flex-row items-center justify-center flex-1 px-4 py-2 bg-blue-100 rounded-lg"
        >
          <Eye size={16} color="#3b82f6" />
          <Text className="ml-2 font-medium text-blue-600">Ver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onDownload(document)}
          className="flex-row items-center justify-center flex-1 px-4 py-2 bg-green-100 rounded-lg"
        >
          <Download size={16} color="#10b981" />
          <Text className="ml-2 font-medium text-green-600">Descargar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DocumentCard;