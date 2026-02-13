// CLIENT APP - components/CaseCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Case } from '../services/casesService';
import { useRouter } from 'expo-router';

interface CaseCardProps {
  case: Case;
  onPress: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onClose: () => void;
  onRate: () => void;
}

const getStageColor = (stage: string): string => {
  const stageLower = stage.toLowerCase();
  
  if (stageLower.includes('publicada') || stageLower.includes('publicado') || stageLower.includes('nuevo') || stageLower.includes('nueva')) {
    return 'bg-blue-500';
  }
  if (stageLower.includes('progreso') || stageLower.includes('asignada') || stageLower.includes('asignado')) {
    return 'bg-yellow-500';
  }
  if (stageLower.includes('cerrado') || stageLower.includes('cerrada') || stageLower.includes('ganada') || stageLower.includes('ganado')) {
    return 'bg-green-500';
  }
  if (stageLower.includes('cancelada') || stageLower.includes('cancelado') || stageLower.includes('perdida') || stageLower.includes('perdido')) {
    return 'bg-red-500';
  }
  
  return 'bg-gray-500';
};

const getStageIcon = (stage: string): any => {
  const stageLower = stage.toLowerCase();
  
  if (stageLower.includes('publicada') || stageLower.includes('publicado') || stageLower.includes('nuevo') || stageLower.includes('nueva')) {
    return 'rocket-outline';
  }
  if (stageLower.includes('progreso') || stageLower.includes('asignada') || stageLower.includes('asignado')) {
    return 'time-outline';
  }
  if (stageLower.includes('cerrado') || stageLower.includes('cerrada') || stageLower.includes('ganada') || stageLower.includes('ganado')) {
    return 'checkmark-circle-outline';
  }
  if (stageLower.includes('cancelada') || stageLower.includes('cancelado') || stageLower.includes('perdida') || stageLower.includes('perdido')) {
    return 'close-circle-outline';
  }
  
  return 'document-text-outline';
};

export default function CaseCard({ 
  case: caseData, 
  onPress, 
  onEdit, 
  onCancel,
  onClose,
  onRate,
}: CaseCardProps) {
  const router = useRouter();
  const stageColor = getStageColor(caseData.stage);
  const stageIcon = getStageIcon(caseData.stage);
  
  const stageLower = caseData.stage.toLowerCase();
  
  // Detectar estados - ajustado para coincidir con los nombres exactos
  const isClosed = stageLower.includes('cerrado') || stageLower.includes('cerrada') || stageLower.includes('ganada') || stageLower.includes('ganado');
  const isCancelled = stageLower.includes('cancelada') || stageLower.includes('cancelado') || stageLower.includes('perdida') || stageLower.includes('perdido');
  const isInProgress = stageLower.includes('progreso') || stageLower.includes('asignada') || stageLower.includes('asignado');
  const isNew = stageLower.includes('publicada') || stageLower.includes('publicado') || stageLower.includes('nuevo') || stageLower.includes('nueva');
  
  const isActive = !isClosed && !isCancelled;
  
  // Debug logging (puedes quitarlo después)
  console.log('Case:', caseData.name, 'Stage:', caseData.stage, 'States:', {
    isClosed,
    isCancelled,
    isInProgress,
    isNew
  });

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Caso',
      '¿Estás seguro que deseas cancelar este caso?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: onCancel },
      ]
    );
  };

  const handleClose = () => {
    Alert.alert(
      'Cerrar Caso',
      '¿Estás seguro que deseas marcar este caso como ganado?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cerrar', style: 'default', onPress: onClose },
      ]
    );
  };

  const handleViewLawyer = () => {
    router.push({
      pathname: '/client/lawyers/[caseId]',
      params: { caseId: caseData.id },
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="p-4 mb-3 bg-white border border-gray-100 rounded-xl"
      activeOpacity={0.7}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text className="mb-2 text-lg font-bold text-gray-900" numberOfLines={1}>
            {caseData.name}
          </Text>
          <View className={`self-start px-3 py-1.5 rounded-lg ${stageColor}`}>
            <View className="flex-row items-center">
              <Ionicons name={stageIcon} size={14} color="white" />
              <Text className="ml-1.5 text-xs font-semibold text-white">
                {caseData.stage}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons para casos activos sin aceptar */}
        {isActive && isNew && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={onEdit}
              className="p-2 bg-gray-100 rounded-lg"
            >
              <Ionicons name="pencil" size={18} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              className="p-2 bg-gray-100 rounded-lg"
            >
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Description */}
      <Text className="mb-3 text-sm leading-5 text-gray-600" numberOfLines={2}>
        {caseData.description}
      </Text>

      {/* Footer - Different actions based on case state */}
      <View className="pt-3 border-t border-gray-100">
        {/* Prioridad 1: Caso cerrado - Calificar */}
        {isClosed ? (
          <TouchableOpacity 
            onPress={onRate}
            className="flex-row items-center justify-center p-3 rounded-lg bg-amber-500"
          >
            <Ionicons name="star" size={18} color="white" />
            <Text className="ml-2 text-sm font-semibold text-white">
              Calificar servicio
            </Text>
          </TouchableOpacity>
        ) : isCancelled ? (
          /* Prioridad 2: Caso cancelado - Solo info */
          <View className="flex-row items-center p-3 rounded-lg bg-gray-50">
            <Ionicons name="information-circle" size={18} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              Caso cancelado
            </Text>
          </View>
        ) : isInProgress ? (
          /* Prioridad 3: Caso en progreso - Ver abogado y cerrar */
          <View className="gap-2">
            <TouchableOpacity 
              onPress={handleViewLawyer}
              className="flex-row items-center justify-between p-3 rounded-lg bg-indigo-50"
            >
              <View className="flex-row items-center">
                <Ionicons name="person" size={18} color="#4F46E5" />
                <Text className="ml-2 text-sm font-semibold text-indigo-700">
                  Ver abogado asignado
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#4F46E5" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleClose}
              className="flex-row items-center justify-center p-3 bg-green-500 rounded-lg"
            >
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text className="ml-2 text-sm font-semibold text-white">
                Marcar como ganado
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Prioridad 4: Caso nuevo - Ver ofertas */
          <TouchableOpacity onPress={onPress}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
                <Text className="ml-2 text-sm text-gray-600">
                  Ver ofertas disponibles
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}