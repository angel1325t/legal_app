import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import offersService, { Offer } from '../../../services/offerService';

export default function OffersScreen() {
  const router = useRouter();
  const { caseId } = useLocalSearchParams();
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, [caseId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await offersService.listCaseOffers(Number(caseId));
      
      if (response.success && response.data) {
        setOffers(response.data);
      } else {
        setError(response.error || 'No se pudieron cargar las ofertas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  const handleAcceptOffer = async (offerId: number) => {
    Alert.alert(
      'Aceptar Oferta',
      '¿Estás seguro de que deseas aceptar esta oferta? Las demás ofertas serán rechazadas automáticamente.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Aceptar',
          style: 'default',
          onPress: async () => {
            try {
              const response = await offersService.acceptOffer(
                Number(caseId),
                offerId
              );
              
              if (response.success) {
                Alert.alert(
                  'Éxito',
                  response.message || 'Oferta aceptada exitosamente',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Redirigir al caso o refrescar
                        router.back();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Error', response.error || 'No se pudo aceptar la oferta');
              }
            } catch (err) {
              Alert.alert('Error', 'Error al aceptar la oferta');
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const handleViewOffer = (offerId: number) => {
    router.push(`/client/offers/detail/${offerId}`);
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStateText = (state: string) => {
    switch (state) {
      case 'accepted':
        return 'Aceptada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  };

  const renderOffer = (offer: Offer) => (
    <View
      key={offer.id}
      className="p-4 mb-4 bg-white border border-gray-200 shadow-sm rounded-xl"
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">
            {offer.lawyer_name}
          </Text>
          <View className={`mt-2 px-3 py-1 rounded-full self-start ${getStateColor(offer.state)}`}>
            <Text className="text-xs font-semibold">
              {getStateText(offer.state)}
            </Text>
          </View>
        </View>
        
        <View className="items-end">
          <Text className="text-2xl font-bold text-indigo-600">
            ${offer.price.toLocaleString()}
          </Text>
          <Text className="text-xs text-gray-500">Honorarios</Text>
        </View>
      </View>

      {/* Message Preview */}
      <View className="p-3 mb-3 rounded-lg bg-gray-50">
        <Text className="text-sm text-gray-700" numberOfLines={3}>
          {offer.message || 'Sin mensaje'}
        </Text>
      </View>

      {/* Actions */}
<View className="flex-row gap-2">
  {/* Ver detalle */}
  <TouchableOpacity
    className="flex-row items-center justify-center flex-1 px-4 py-3 bg-indigo-100 rounded-lg"
    onPress={() => handleViewOffer(offer.id)}
  >
    <Ionicons name="eye-outline" size={20} color="#4F46E5" />
    <Text className="ml-2 font-semibold text-indigo-600">
      Ver Detalle
    </Text> 
  </TouchableOpacity>

  {/* Aceptar oferta */}
  {offer.state === 'sent' && (
    <TouchableOpacity
      className="flex-row items-center justify-center flex-1 px-4 py-3 bg-green-600 rounded-lg"
      onPress={() => handleAcceptOffer(offer.id)}
    >
      <Ionicons
        name="checkmark-circle-outline"
        size={20}
        color="white"
      />
      <Text className="ml-2 font-semibold text-white">
        Aceptar
      </Text>
    </TouchableOpacity>
  )}
</View>

    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-gray-600">Cargando ofertas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
          Ofertas Recibidas
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
          />
        }
      >
        {error ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text className="mt-4 text-center text-gray-600">{error}</Text>
            <TouchableOpacity
              className="px-6 py-3 mt-4 bg-indigo-600 rounded-lg"
              onPress={fetchOffers}
            >
              <Text className="font-semibold text-white">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : offers.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
            <Text className="mt-4 text-xl font-semibold text-gray-900">
              Sin Ofertas
            </Text>
            <Text className="mt-2 text-center text-gray-600">
              Aún no has recibido ofertas para este caso
            </Text>
          </View>
        ) : (
          <>
            {/* Summary */}
            <View className="p-4 mb-4 bg-white rounded-xl">
              <Text className="text-sm text-gray-600">
                Total de ofertas: <Text className="font-bold">{offers.length}</Text>
              </Text>
              <Text className="mt-1 text-sm text-gray-600">
                Pendientes: <Text className="font-bold text-yellow-600">
                  {offers.filter(o => o.state === 'sent').length}
                </Text>
              </Text>
            </View>

            {/* Offers List */}
            {offers.map(renderOffer)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}