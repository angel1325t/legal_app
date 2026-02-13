// CLIENT APP - app/client/cases/edit/[caseId].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import caseService, { Case } from '../../../../services/casesService';

export default function EditCaseScreen() {
  const router = useRouter();
  const { caseId } = useLocalSearchParams();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await caseService.getCase(Number(caseId));

      if (response.success && response.data) {
        setCaseData(response.data);
        setName(response.data.name);
        setDescription(response.data.description);
      } else {
        setError(response.error || 'No se pudo cargar el caso');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validaciones
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del caso es requerido');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'La descripción del caso es requerida');
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Error', 'La descripción debe tener al menos 10 caracteres');
      return;
    }

    try {
      setSaving(true);

      const response = await caseService.updateCase(Number(caseId), {
        name: name.trim(),
        description: description.trim(),
      });

      if (response.success) {
        Alert.alert(
          'Éxito',
          response.message || 'Caso actualizado exitosamente',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo actualizar el caso');
      }
    } catch (err) {
      Alert.alert('Error', 'Error al actualizar el caso');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Edición',
      '¿Estás seguro? Los cambios no guardados se perderán.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-sm text-gray-600">Cargando caso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !caseData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1 px-6">
          <View className="items-center w-full p-8 bg-white rounded-2xl">
            <View className="items-center justify-center w-16 h-16 bg-red-50 rounded-xl">
              <Ionicons name="alert-circle" size={32} color="#DC2626" />
            </View>
            <Text className="mt-4 text-lg font-bold text-gray-900">
              {error || 'Caso no encontrado'}
            </Text>
            <TouchableOpacity
              className="px-6 py-3 mt-6 bg-gray-900 rounded-xl"
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text className="text-sm font-semibold text-white">Volver</Text>
            </TouchableOpacity>
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
            onPress={handleCancel}
            className="items-center justify-center w-10 h-10 bg-gray-100 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            Editar Caso
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Case ID Info */}
          <View className="p-4 mb-6 bg-blue-50 rounded-xl">
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <View className="flex-1 ml-3">
                <Text className="text-xs font-medium text-blue-700">ID del Caso</Text>
                <Text className="text-sm font-bold text-blue-900">#{caseData.id}</Text>
              </View>
              <View className="px-3 py-1 bg-blue-100 rounded-lg">
                <Text className="text-xs font-bold text-blue-700">{caseData.stage}</Text>
              </View>
            </View>
          </View>

          {/* Nombre del Caso */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold text-gray-900">
              Nombre del Caso
              <Text className="text-red-500"> *</Text>
            </Text>
            <View className="bg-white border border-gray-200 rounded-xl">
              <TextInput
                className="px-4 py-3 text-base text-gray-900"
                placeholder="Ej: Divorcio Express"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                maxLength={100}
              />
            </View>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-xs text-gray-500">
                Mínimo 3 caracteres
              </Text>
              <Text className="text-xs text-gray-500">
                {name.length}/100
              </Text>
            </View>
          </View>

          {/* Descripción */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold text-gray-900">
              Descripción del Caso
              <Text className="text-red-500"> *</Text>
            </Text>
            <View className="bg-white border border-gray-200 rounded-xl">
              <TextInput
                className="px-4 py-3 text-base text-gray-900"
                placeholder="Describe los detalles de tu caso..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                maxLength={1000}
              />
            </View>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-xs text-gray-500">
                Mínimo 10 caracteres
              </Text>
              <Text className="text-xs text-gray-500">
                {description.length}/1000
              </Text>
            </View>
          </View>

          {/* Categorías (solo lectura) */}
          {caseData.categories && caseData.categories.length > 0 && (
            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-gray-900">
                Categorías Asignadas
              </Text>
              <View className="p-4 border border-gray-200 bg-gray-50 rounded-xl">
                <View className="flex-row flex-wrap gap-2">
                  {caseData.categories.map((category, index) => (
                    <View
                      key={index}
                      className="px-3 py-1.5 bg-indigo-100 rounded-lg"
                    >
                      <Text className="text-xs font-semibold text-indigo-700">
                        {category}
                      </Text>
                    </View>
                  ))}
                </View>
                <View className="flex-row items-start mt-3">
                  <Ionicons name="lock-closed" size={14} color="#6B7280" />
                  <Text className="flex-1 ml-2 text-xs text-gray-600">
                    Las categorías no se pueden modificar una vez creado el caso
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Info Note */}
          <View className="p-4 mb-6 border bg-amber-50 border-amber-200 rounded-xl">
            <View className="flex-row items-start">
              <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              <Text className="flex-1 ml-3 text-sm text-amber-900">
                Solo puedes editar el nombre y la descripción del caso. Las categorías 
                y el estado no pueden ser modificados.
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="gap-3 mb-6">
            <TouchableOpacity
              className={`flex-row items-center justify-center p-4 rounded-xl ${
                saving || !name.trim() || !description.trim()
                  ? 'bg-gray-300'
                  : 'bg-indigo-600'
              }`}
              onPress={handleSave}
              disabled={saving || !name.trim() || !description.trim()}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="white" />
                  <Text className="ml-2 text-base font-bold text-white">
                    Guardar Cambios
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center p-4 bg-gray-100 rounded-xl"
              onPress={handleCancel}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={20} color="#6B7280" />
              <Text className="ml-2 text-base font-bold text-gray-700">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}