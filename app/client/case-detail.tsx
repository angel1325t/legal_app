// CLIENT APP - app/client/case-detail.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import caseService, { Case } from '../../services/casesService';
import EditCaseDialog from '../../components/dialogs/EditCaseDialog';

export default function CaseDetailScreen() {
  const router = useRouter();
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  const loadCaseDetail = async () => {
    if (!caseId) return;
    
    setLoading(true);
    const response = await caseService.getCase(Number(caseId));
    
    if (response.success && response.data) {
      setCaseData(response.data);
    } else {
      Alert.alert('Error', response.error || 'No se pudo cargar el caso');
      router.back();
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadCaseDetail();
  }, [caseId]);

  const handleClose = async () => {
    if (!caseData) return;
    
    Alert.alert(
      'Cerrar Caso',
      '¿Estás seguro que deseas cerrar este caso? Esta acción marca el caso como completado exitosamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar caso',
          onPress: async () => {
            const response = await caseService.closeCase(caseData.id);
            if (response.success) {
              Alert.alert('Éxito', 'Caso cerrado exitosamente');
              router.back();
            } else {
              Alert.alert('Error', response.error || 'No se pudo cerrar el caso');
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    if (!caseData) return;
    
    Alert.alert(
      'Cancelar Caso',
      '¿Estás seguro que deseas cancelar este caso?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            const response = await caseService.cancelCase(caseData.id);
            if (response.success) {
              Alert.alert('Éxito', 'Caso cancelado exitosamente');
              router.back();
            } else {
              Alert.alert('Error', response.error || 'No se pudo cancelar el caso');
            }
          },
        },
      ]
    );
  };

  const handleEditSuccess = () => {
    loadCaseDetail();
  };

  const getStageColor = (stage: string): string => {
    const stageLower = stage.toLowerCase();
    
    if (stageLower.includes('publicada') || stageLower.includes('nuevo')) {
      return 'bg-blue-500';
    }
    if (stageLower.includes('progreso') || stageLower.includes('asignada')) {
      return 'bg-yellow-500';
    }
    if (stageLower.includes('cerrada') || stageLower.includes('ganada')) {
      return 'bg-green-500';
    }
    if (stageLower.includes('cancelada') || stageLower.includes('perdida')) {
      return 'bg-red-500';
    }
    
    return 'bg-gray-500';
  };

  const isActive = caseData && 
    !caseData.stage.toLowerCase().includes('cerrada') && 
    !caseData.stage.toLowerCase().includes('cancelada') &&
    !caseData.stage.toLowerCase().includes('ganada') &&
    !caseData.stage.toLowerCase().includes('perdida');

  if (loading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-500">Cargando detalles...</Text>
      </SafeAreaView>
    );
  }

  if (!caseData) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-gray-50">
        <Text className="text-gray-500">No se encontró el caso</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2 -ml-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Detalle del Caso</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View className="px-6 pt-6">
          <View className={`self-start px-4 py-2 rounded-full ${getStageColor(caseData.stage)}`}>
            <Text className="font-semibold text-white">
              {caseData.stage}
            </Text>
          </View>
        </View>

        {/* Case Info Card */}
        <View className="p-6 mx-6 mt-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
          <Text className="mb-4 text-2xl font-bold text-gray-800">
            {caseData.name}
          </Text>
          
          <View className="pb-4 mb-4 border-b border-gray-100">
            <Text className="mb-2 text-sm font-semibold text-gray-500">
              DESCRIPCIÓN
            </Text>
            <Text className="text-base leading-6 text-gray-700">
              {caseData.description}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="document-text-outline" size={20} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-500">
              ID del caso: <Text className="font-semibold">{caseData.id}</Text>
            </Text>
          </View>
        </View>

        {/* Actions */}
        {isActive && (
          <View className="px-6 mt-6">
            <Text className="mb-4 text-lg font-bold text-gray-800">
              Acciones
            </Text>
            
            <TouchableOpacity
              onPress={() => setEditDialogVisible(true)}
              className="flex-row items-center p-4 mb-3 bg-white border border-gray-200 shadow-sm rounded-xl"
            >
              <View className="items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <Ionicons name="pencil" size={20} color="#2563eb" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-bold text-gray-800">Editar Caso</Text>
                <Text className="text-sm text-gray-500">
                  Actualizar nombre y descripción
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              className="flex-row items-center p-4 mb-3 bg-white border border-gray-200 shadow-sm rounded-xl"
            >
              <View className="items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-bold text-gray-800">Cerrar Caso</Text>
                <Text className="text-sm text-gray-500">
                  Marcar como completado exitosamente
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              className="flex-row items-center p-4 bg-white border border-gray-200 shadow-sm rounded-xl"
            >
              <View className="items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <Ionicons name="close-circle" size={20} color="#dc2626" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-bold text-gray-800">Cancelar Caso</Text>
                <Text className="text-sm text-gray-500">
                  Marcar como cancelado
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Info Section */}
        <View className="p-6 mx-6 mt-6 mb-8 border border-blue-200 bg-blue-50 rounded-xl">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#2563eb" />
            <View className="flex-1 ml-3">
              <Text className="mb-1 font-semibold text-blue-800">
                Información importante
              </Text>
              <Text className="text-sm leading-5 text-blue-700">
                Los casos cerrados o cancelados no pueden ser editados. 
                Mantén actualizada la información para recibir las mejores ofertas de abogados.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Dialog */}
      <EditCaseDialog
        visible={editDialogVisible}
        caseData={caseData}
        onClose={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </SafeAreaView>
  );
}