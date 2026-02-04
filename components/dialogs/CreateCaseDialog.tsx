// CLIENT APP - components/dialogs/CreateCaseDialog.tsx

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
import { LegalCategory, addStylesToCategories } from '../../constants/categories';
import caseService, { CreateCaseData } from '../../services/casesService';
import categoryService from '../../services/categoryService';

interface CreateCaseDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCaseDialog({ 
  visible, 
  onClose, 
  onSuccess 
}: CreateCaseDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [caseName, setCaseName] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<LegalCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Cargar categorías cuando el diálogo se abre
  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    const response = await categoryService.listCategories();
    
    if (response.success && response.data) {
      // Agregar estilos visuales a las categorías del backend
      const styledCategories = addStylesToCategories(response.data);
      setCategories(styledCategories);
    } else {
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    }
    
    setLoadingCategories(false);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCategories([]);
    setCaseName('');
    setCaseDescription('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleNext = () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos una categoría legal');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!caseName.trim()) {
      Alert.alert('Error', 'El nombre del caso es obligatorio ');
      
      return;
    }

    if (!caseDescription.trim()) {
      Alert.alert('Error', 'La descripción del caso es obligatoria');
      return;
    }

    setLoading(true);

    const data: CreateCaseData = {
      name: caseName,
      description: caseDescription,
      category_ids: selectedCategories,
    };

    const response = await caseService.createCase(data);

    setLoading(false);

    if (response.success) {
      Alert.alert('Éxito', 'Caso creado exitosamente', [
        {
          text: 'OK',
          onPress: () => {
            handleClose();
            onSuccess();
          },
        },
      ]);
    } else {
      Alert.alert('Error', response.error || 'No se pudo crear el caso');
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
                {step === 1 ? 'Nuevo Caso' : 'Detalles del Caso'}
              </Text>
              <Text className="text-sm text-gray-500">
                {step === 1 ? 'Selecciona las categorías' : 'Completa la información'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="p-2 bg-gray-100 rounded-full"
            >
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row px-6 py-4 bg-white">
            <View className="flex-row items-center flex-1">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${
                step === 1 ? 'bg-blue-600' : 'bg-green-500'
              }`}>
                {step === 1 ? (
                  <Text className="font-bold text-white">1</Text>
                ) : (
                  <Ionicons name="checkmark" size={20} color="white" />
                )}
              </View>
              <View className={`flex-1 h-1 mx-2 ${step === 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <View className={`w-8 h-8 rounded-full items-center justify-center ${
                step === 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                <Text className={`font-bold ${step === 2 ? 'text-white' : 'text-gray-500'}`}>2</Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 px-6 py-6">
            {step === 1 ? (
              /* Step 1: Categories */
              <View>
                <Text className="mb-4 text-base text-gray-600">
                  Selecciona las especialidades legales relacionadas con tu caso
                </Text>
                
                {loadingCategories ? (
                  <View className="items-center justify-center py-12">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="mt-4 text-gray-500">Cargando categorías...</Text>
                  </View>
                ) : categories.length === 0 ? (
                  <View className="items-center justify-center py-12">
                    <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
                    <Text className="mt-4 text-center text-gray-500">
                      No hay categorías disponibles
                    </Text>
                  </View>
                ) : (
                  <View>
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category.id);
                      return (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => toggleCategory(category.id)}
                          className={`p-4 rounded-2xl border-2 mb-3 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                          activeOpacity={0.7}
                        >
                          <View className="flex-row items-center">
                            <View className={`w-12 h-12 rounded-xl items-center justify-center ${category.color || 'bg-gray-500'}`}>
                              <Ionicons 
                                name={category.icon as any || 'document-text'} 
                                size={24} 
                                color="white" 
                              />
                            </View>
                            <View className="flex-1 ml-4">
                              <Text className={`font-bold text-base ${
                                isSelected ? 'text-blue-700' : 'text-gray-800'
                              }`}>
                                {category.name}
                              </Text>
                              {category.description && (
                                <Text className="text-sm text-gray-500">
                                  {category.description}
                                </Text>
                              )}
                            </View>
                            {isSelected && (
                              <View className="p-1 bg-blue-500 rounded-full">
                                <Ionicons name="checkmark" size={20} color="white" />
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : (
              /* Step 2: Case Details */
              <View>
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
                    numberOfLines={6}
                    textAlignVertical="top"
                    className="p-4 text-base bg-white border-2 border-gray-200 rounded-xl"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Selected Categories Summary */}
                <View className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
                  <Text className="mb-2 text-sm font-semibold text-gray-700">
                    Categorías seleccionadas:
                  </Text>
                  <View className="flex-row flex-wrap">
                    {selectedCategories.map((catId) => {
                      const category = categories.find(c => c.id === catId);
                      if (!category) return null;
                      return (
                        <View
                          key={catId}
                          className="flex-row items-center px-3 py-2 mb-2 mr-2 bg-blue-100 rounded-full"
                        >
                          <Ionicons 
                            name={category.icon as any || 'document-text'} 
                            size={16} 
                            color="#2563eb" 
                          />
                          <Text className="ml-2 text-sm font-semibold text-blue-700">
                            {category.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View className="px-6 py-4 bg-white border-t border-gray-200">
            {step === 1 ? (
              <TouchableOpacity
                onPress={handleNext}
                disabled={selectedCategories.length === 0 || loadingCategories}
                className={`py-4 rounded-xl items-center ${
                  selectedCategories.length === 0 || loadingCategories ? 'bg-gray-300' : 'bg-blue-600'
                }`}
              >
                <Text className="text-base font-bold text-white">
                  Continuar
                </Text>
              </TouchableOpacity>
            ) : (
              <View>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className="items-center py-4 mb-3 bg-blue-600 rounded-xl"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-base font-bold text-white">
                      Crear Caso
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  disabled={loading}
                  className="items-center py-4 bg-gray-200 rounded-xl"
                >
                  <Text className="text-base font-bold text-gray-700">
                    Atrás
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}