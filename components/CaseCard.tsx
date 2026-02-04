// CLIENT APP - components/CaseCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Case } from '../services/casesService';

interface CaseCardProps {
  case: Case;
  onPress: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

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

const getStageIcon = (stage: string): any => {
  const stageLower = stage.toLowerCase();
  
  if (stageLower.includes('publicada') || stageLower.includes('nuevo')) {
    return 'rocket-outline';
  }
  if (stageLower.includes('progreso') || stageLower.includes('asignada')) {
    return 'time-outline';
  }
  if (stageLower.includes('cerrada') || stageLower.includes('ganada')) {
    return 'checkmark-circle-outline';
  }
  if (stageLower.includes('cancelada') || stageLower.includes('perdida')) {
    return 'close-circle-outline';
  }
  
  return 'document-text-outline';
};

export default function CaseCard({ 
  case: caseData, 
  onPress, 
  onEdit, 
  onCancel 
}: CaseCardProps) {
  const stageColor = getStageColor(caseData.stage);
  const stageIcon = getStageIcon(caseData.stage);
  const isActive = !caseData.stage.toLowerCase().includes('cerrada') && 
                   !caseData.stage.toLowerCase().includes('cancelada') &&
                   !caseData.stage.toLowerCase().includes('ganada') &&
                   !caseData.stage.toLowerCase().includes('perdida');

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

  return (
    <TouchableOpacity
      onPress={onPress}
      className="p-4 mb-3 bg-white border border-gray-200 shadow-sm rounded-2xl"
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text className="mb-1 text-lg font-bold text-gray-800" numberOfLines={1}>
            {caseData.name}
          </Text>
          <View className={`self-start px-3 py-1 rounded-full ${stageColor}`}>
            <View className="flex-row items-center">
              <Ionicons name={stageIcon} size={14} color="white" />
              <Text className="ml-1 text-xs font-semibold text-white">
                {caseData.stage}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {isActive && (
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={onEdit}
              className="p-2 bg-blue-100 rounded-full"
            >
              <Ionicons name="pencil" size={18} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              className="p-2 bg-red-100 rounded-full"
            >
              <Ionicons name="close" size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Description */}
      <Text className="mb-3 text-sm text-gray-600" numberOfLines={2}>
        {caseData.description}
      </Text>

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <Ionicons name="document-text-outline" size={16} color="#6B7280" />
          <Text className="ml-1 text-xs text-gray-500">
            ID: {caseData.id}
          </Text>
        </View>
        <TouchableOpacity onPress={onPress}>
          <View className="flex-row items-center">
            <Text className="mr-1 text-sm font-semibold text-blue-600">
              Ver detalles
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#2563eb" />
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}