// CLIENT APP - app/client/lawyers/comments/[lawyerId].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ratingService, { Rating } from '../../../../services/ratingService';
import RatingComment from '../../../../components/RatingComment';

export default function LawyerCommentsScreen() {
  const router = useRouter();
  const { lawyerId, lawyerName } = useLocalSearchParams();
  
  const [comments, setComments] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [lawyerId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ratingService.getLawyerComments(Number(lawyerId));
      
      if (response.success && response.comments) {
        setComments(response.comments);
      } else {
        setError(response.error || 'No se pudieron cargar los comentarios');
      }
    } catch (err) {
      setError('Error al cargar los comentarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-sm text-gray-600">Cargando comentarios...</Text>
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
            Todas las Valoraciones
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Lawyer Info */}
        <View className="p-4 mb-6 bg-white rounded-xl">
          <View className="flex-row items-center">
            <View className="items-center justify-center w-12 h-12 mr-3 bg-indigo-100 rounded-xl">
              <Ionicons name="person" size={24} color="#4F46E5" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                Abogado
              </Text>
              <Text className="text-base font-bold text-gray-900">
                {lawyerName || 'Abogado'}
              </Text>
            </View>
            <View className="px-3 py-1 rounded-lg bg-indigo-50">
              <Text className="text-sm font-bold text-indigo-700">
                {comments.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Comments List */}
        {error ? (
          <View className="items-center p-8 bg-white rounded-xl">
            <View className="items-center justify-center w-16 h-16 mb-4 bg-red-50 rounded-xl">
              <Ionicons name="alert-circle" size={32} color="#DC2626" />
            </View>
            <Text className="text-base font-semibold text-gray-900">{error}</Text>
          </View>
        ) : comments.length === 0 ? (
          <View className="items-center p-8 bg-white rounded-xl">
            <View className="items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-xl">
              <Ionicons name="chatbubbles-outline" size={32} color="#6B7280" />
            </View>
            <Text className="text-base font-semibold text-gray-900">
              Sin comentarios
            </Text>
            <Text className="mt-2 text-sm text-center text-gray-600">
              Este abogado aún no ha recibido valoraciones
            </Text>
          </View>
        ) : (
          <>
            {comments.map((comment) => (
              <RatingComment key={comment.id} rating={comment} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}