// CLIENT APP - components/dialogs/EditCaseDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import caseService, { Case, UpdateCaseData } from '../../services/casesService';

interface EditCaseDialogProps {
  visible: boolean;
  caseData: Case | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCaseDialog({ 
  visible, 
  caseData,
  onClose, 
  onSuccess 
}: EditCaseDialogProps) {
  const [caseName, setCaseName] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (caseData) {
      setCaseName(caseData.name);
      setCaseDescription(caseData.description);
    }
  }, [caseData]);

  const resetForm = () => {
    setCaseName('');
    setCaseDescription('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!caseData) return;

    if (!caseName.trim()) {
      Alert.alert('Error', 'El nombre del caso es obligatorio');
      return;
    }

    if (!caseDescription.trim()) {
      Alert.alert('Error', 'La descripción del caso es obligatoria');
      return;
    }

    setLoading(true);

    const data: UpdateCaseData = {
      name: caseName,
      description: caseDescription,
    };

    const response = await caseService.updateCase(caseData.id, data);

    setLoading(false);

    if (response.success) {
      Alert.alert('Éxito', 'Caso actualizado exitosamente', [
        {
          text: 'OK',
          onPress: () => {
            handleClose();
            onSuccess();
          },
        },
      ]);
    } else {
      Alert.alert('Error', response.error || 'No se pudo actualizar el caso');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-gray-50 rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4 bg-white border-b border-gray-200">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">
                Editar Caso
              </Text>
              <Text className="text-sm text-gray-500">
                Actualiza la información de tu caso
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="p-2 bg-gray-100 rounded-full"
            >
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 px-6 py-6">
            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Nombre del Caso *
              </Text>
              <TextInput
                value={caseName}
                onChangeText={setCaseName}
                placeholder="Ej: Divorcio mutuo acuerdo"
                className="p-4 text-base bg-white border-2 border-gray-200 rounded-xl"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                Descripción del Caso *
              </Text>
              <TextInput
                value={caseDescription}
                onChangeText={setCaseDescription}
                placeholder="Describe los detalles de tu caso..."
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                className="p-4 text-base bg-white border-2 border-gray-200 rounded-xl"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Case Info */}
            <View className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="#2563eb" />
                <Text className="ml-2 text-sm font-semibold text-blue-700">
                  Información del caso
                </Text>
              </View>
              <Text className="text-sm text-gray-600">
                Estado actual: <Text className="font-semibold">{caseData?.stage}</Text>
              </Text>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View className="px-6 py-4 bg-white border-t border-gray-200">
            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="items-center py-4 bg-blue-600 rounded-xl"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-base font-bold text-white">
                    Guardar Cambios
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClose}
                disabled={loading}
                className="items-center py-4 bg-gray-200 rounded-xl"
              >
                <Text className="text-base font-bold text-gray-700">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}