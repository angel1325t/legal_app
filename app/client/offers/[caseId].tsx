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

  const getStateConfig = (state: string) => {
    switch (state) {
      case 'accepted':
        return {
          bgColor: '#ECFDF5',
          textColor: '#065F46',
          borderColor: '#6EE7B7',
          icon: 'checkmark-circle' as const,
          text: 'Aceptada',
        };
      case 'rejected':
        return {
          bgColor: '#FEF2F2',
          textColor: '#991B1B',
          borderColor: '#FCA5A5',
          icon: 'close-circle' as const,
          text: 'Rechazada',
        };
      default:
        return {
          bgColor: '#FFFBEB',
          textColor: '#92400E',
          borderColor: '#FCD34D',
          icon: 'time' as const,
          text: 'Pendiente',
        };
    }
  };

  const renderOffer = (offer: Offer) => {
    const stateConfig = getStateConfig(offer.state);
    
    return (
      <View
        key={offer.id}
        className="p-5 mb-4 bg-white rounded-2xl"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 pr-3">
            <View className="flex-row items-center mb-2">
              <View className="items-center justify-center w-10 h-10 mr-3 bg-indigo-100 rounded-xl">
                <Ionicons name="person" size={20} color="#4F46E5" />
              </View>
              <Text className="flex-1 text-lg font-bold text-gray-900">
                {offer.lawyer_name}
              </Text>
            </View>
            
            <View 
              className="self-start px-3 py-2 rounded-xl"
              style={{ 
                backgroundColor: stateConfig.bgColor,
                borderWidth: 1,
                borderColor: stateConfig.borderColor,
              }}
            >
              <View className="flex-row items-center">
                <Ionicons name={stateConfig.icon} size={14} color={stateConfig.textColor} />
                <Text 
                  className="ml-1 text-xs font-bold"
                  style={{ color: stateConfig.textColor }}
                >
                  {stateConfig.text}
                </Text>
              </View>
            </View>
          </View>
          
          <View className="items-end">
            <View className="px-4 py-2 bg-indigo-600 rounded-xl">
              <Text className="text-2xl font-bold text-white">
                ${offer.price.toLocaleString()}
              </Text>
            </View>
            <Text className="mt-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Honorarios
            </Text>
          </View>
        </View>

        {/* Message Preview */}
        <View 
          className="p-4 mb-4 bg-gray-50 rounded-xl"
          style={{ borderWidth: 1, borderColor: '#F3F4F6' }}
        >
          <View className="flex-row items-center mb-2">
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Mensaje
            </Text>
          </View>
          <Text className="text-sm leading-5 text-gray-700" numberOfLines={3}>
            {offer.message || 'Sin mensaje'}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row gap-3">
          {/* Ver detalle */}
          <TouchableOpacity
            className="flex-row items-center justify-center flex-1 px-4 py-3 bg-indigo-100 rounded-xl"
            onPress={() => handleViewOffer(offer.id)}
            activeOpacity={0.8}
          >
            <View className="items-center justify-center w-6 h-6 mr-2 bg-indigo-200 rounded-lg">
              <Ionicons name="eye" size={16} color="#4F46E5" />
            </View>
            <Text className="font-bold text-indigo-700">
              Ver Detalle
            </Text> 
          </TouchableOpacity>

          {/* Aceptar oferta */}
          {offer.state === 'sent' && (
            <TouchableOpacity
              className="flex-row items-center justify-center flex-1 px-4 py-3 bg-green-500 rounded-xl"
              onPress={() => handleAcceptOffer(offer.id)}
              activeOpacity={0.85}
              style={{
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <View className="items-center justify-center w-6 h-6 mr-2 bg-green-400 rounded-lg">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <Text className="font-bold text-white">
                Aceptar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1">
          <View 
            className="items-center justify-center w-20 h-20 bg-white rounded-3xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
          <Text className="mt-6 text-base font-semibold text-gray-700">Cargando ofertas...</Text>
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
            Ofertas Recibidas
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      >
        {error ? (
          <View className="items-center justify-center py-12">
            <View 
              className="items-center p-8 bg-white rounded-3xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="items-center justify-center w-16 h-16 bg-red-100 rounded-2xl">
                <Ionicons name="alert-circle" size={36} color="#EF4444" />
              </View>
              <Text className="mt-4 text-lg font-bold text-gray-900">Error</Text>
              <Text className="mt-2 text-center text-gray-600">{error}</Text>
              <TouchableOpacity
                className="px-6 py-3 mt-6 bg-indigo-600 rounded-xl"
                onPress={fetchOffers}
                activeOpacity={0.8}
              >
                <Text className="font-bold text-white">Reintentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : offers.length === 0 ? (
          <View className="items-center justify-center py-12">
            <View 
              className="items-center p-8 bg-white rounded-3xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <View className="items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl">
                <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
              </View>
              <Text className="mt-6 text-2xl font-bold text-gray-900">
                Sin Ofertas
              </Text>
              <Text className="mt-3 text-base leading-6 text-center text-gray-600">
                Aún no has recibido ofertas para este caso
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Summary */}
            <View 
              className="p-5 mb-5 bg-white rounded-2xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <View className="flex-row items-center mb-3">
                <View className="items-center justify-center w-10 h-10 mr-3 bg-indigo-100 rounded-xl">
                  <Ionicons name="stats-chart" size={20} color="#4F46E5" />
                </View>
                <Text className="text-lg font-bold text-gray-900">Resumen</Text>
              </View>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-500">
                    Total de ofertas
                  </Text>
                  <Text className="text-2xl font-bold text-gray-900">
                    {offers.length}
                  </Text>
                </View>
                
                <View className="w-px h-12 bg-gray-200" />
                
                <View className="flex-1 pl-4">
                  <Text className="text-sm font-medium text-gray-500">
                    Pendientes
                  </Text>
                  <Text className="text-2xl font-bold text-yellow-600">
                    {offers.filter(o => o.state === 'sent').length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Offers List */}
            {offers.map(renderOffer)}
            
            {/* Bottom spacing */}
            <View className="h-6" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}