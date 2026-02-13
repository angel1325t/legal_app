// CLIENT APP - app/client/cases/rate/[caseId].tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ratingService from '../../../services/ratingService';

export default function RateCaseScreen() {
  const router = useRouter();
  const { caseId, caseName } = useLocalSearchParams();
  
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (score === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    try {
      setLoading(true);
      const response = await ratingService.createRating(Number(caseId), {
        score,
        comment: comment.trim(),
      });

      if (response.success) {
        Alert.alert(
          'Éxito',
          'Calificación enviada exitosamente',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo enviar la calificación');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al enviar la calificación');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View className="flex-row justify-center gap-3 my-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setScore(star)}
            activeOpacity={0.7}
            className="p-2"
          >
            <Ionicons
              name={star <= score ? 'star' : 'star-outline'}
              size={44}
              color={star <= score ? '#F59E0B' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getScoreLabel = () => {
    if (score === 0) return 'Selecciona tu calificación';
    const labels = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
    return labels[score - 1];
  };

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
            Calificar Servicio
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Case Info */}
        <View 
          className="p-5 mb-6 bg-white rounded-xl"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View className="flex-row items-center mb-2">
            <View className="items-center justify-center w-10 h-10 mr-3 bg-indigo-100 rounded-lg">
              <Ionicons name="document-text" size={20} color="#4F46E5" />
            </View>
            <Text className="text-sm font-medium text-gray-500">
              Caso
            </Text>
          </View>
          <Text className="text-lg font-bold text-gray-900">
            {caseName || 'Caso sin nombre'}
          </Text>
        </View>

        {/* Rating Section */}
        <View 
          className="p-6 mb-6 bg-white rounded-xl"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text className="mb-2 text-base font-semibold text-center text-gray-900">
            ¿Cómo calificarías el servicio?
          </Text>
          
          {renderStars()}
          
          <View className="items-center px-4 py-2 rounded-lg bg-amber-50">
            <Text className="text-sm font-bold text-amber-900">
              {getScoreLabel()}
            </Text>
          </View>
        </View>

        {/* Comment Section */}
        <View 
          className="p-5 mb-6 bg-white rounded-xl"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View className="flex-row items-center mb-3">
            <View className="items-center justify-center w-10 h-10 mr-3 bg-purple-100 rounded-lg">
              <Ionicons name="chatbubble-ellipses" size={20} color="#7C3AED" />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              Comentario (Opcional)
            </Text>
          </View>
          
          <TextInput
            className="p-4 text-base text-gray-900 rounded-lg bg-gray-50"
            placeholder="Cuéntanos sobre tu experiencia..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            maxLength={500}
          />
          
          <Text className="mt-2 text-xs text-right text-gray-500">
            {comment.length}/500
          </Text>
        </View>

        {/* Info */}
        <View 
          className="p-4 mb-6 bg-blue-50 rounded-xl"
          style={{ borderWidth: 1, borderColor: '#BFDBFE' }}
        >
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="flex-1 ml-3 text-sm leading-5 text-blue-900">
              Tu calificación ayudará a otros usuarios a elegir el mejor abogado para su caso.
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || score === 0}
          className={`flex-row items-center justify-center p-4 rounded-xl ${
            loading || score === 0 ? 'bg-gray-300' : 'bg-indigo-600'
          }`}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="white" />
              <Text className="ml-2 text-base font-bold text-white">
                Enviar Calificación
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}