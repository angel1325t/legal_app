import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import offersService, { Offer } from '../../../services/offerService';

export default function FavoriteOffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      const response = await offersService.listFavoriteOffers();
      if (response.success && response.data) {
        setOffers(response.data);
      } else {
        Alert.alert('Error', response.error || 'No se pudieron cargar los favoritos');
      }
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites();
  }, []);

  const removeFavorite = async (offerId: number) => {
    const response = await offersService.setOfferFavorite(offerId, false);
    if (!response.success) {
      Alert.alert('Error', response.error || 'No se pudo quitar de favoritos');
      return;
    }
    setOffers((current) => current.filter((offer) => offer.id !== offerId));
  };

  if (loading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-gray-50">
        <ActivityIndicator size="large" color="#BE185D" />
        <Text className="mt-3 text-gray-600">Cargando favoritos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="items-center justify-center w-10 h-10 bg-gray-100 rounded-xl">
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Ofertas Favoritas</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {offers.length === 0 ? (
          <View className="items-center p-8 mt-20 bg-white rounded-2xl">
            <Ionicons name="heart-outline" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-lg font-semibold text-gray-900">No tienes favoritos</Text>
            <Text className="mt-2 text-center text-gray-600">Marca ofertas como favoritas para verlas aqui.</Text>
          </View>
        ) : (
          offers.map((offer) => (
            <View key={offer.id} className="p-4 mb-3 bg-white rounded-2xl">
              <Text className="text-base font-bold text-gray-900">{offer.case_name}</Text>
              <Text className="mt-1 text-sm text-gray-600">{offer.lawyer_name}</Text>
              <Text className="mt-2 text-2xl font-bold text-pink-700">${offer.price.toLocaleString()}</Text>
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => router.push(`/client/offers/detail/${offer.id}`)}
                  className="items-center justify-center flex-1 py-3 bg-indigo-100 rounded-xl"
                >
                  <Text className="font-semibold text-indigo-700">Ver detalle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeFavorite(offer.id)}
                  className="items-center justify-center flex-1 py-3 bg-rose-100 rounded-xl"
                >
                  <Text className="font-semibold text-rose-700">Quitar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
