// CLIENT APP - app/client/offers/detail/[offerId].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import offersService, { OfferDetail } from '../../../../services/offerService';

export default function OfferDetailScreen() {
  const router = useRouter();
  const { offerId } = useLocalSearchParams();
  
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOfferDetail();
  }, [offerId]);

  const fetchOfferDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await offersService.getOfferDetail(Number(offerId));
      
      if (response.success && response.data) {
        setOffer(response.data);
      } else {
        setError(response.error || 'No se pudo cargar el detalle de la oferta');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!offer) return;

    Alert.alert(
      'Aceptar Oferta',
      '¿Estás seguro de que deseas aceptar esta oferta? Las demás ofertas serán rechazadas automáticamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          style: 'default',
          onPress: async () => {
            try {
              const response = await offersService.acceptOffer(
                offer.case_id,
                offer.id
              );
              
              if (response.success) {
                Alert.alert(
                  'Éxito',
                  response.message || 'Oferta aceptada exitosamente',
                  [{ text: 'OK', onPress: () => router.back() }]
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

  const getStateConfig = (state: string) => {
    switch (state) {
      case 'accepted':
        return {
          color: '#059669',
          bgColor: '#ECFDF5',
          icon: 'checkmark-circle' as const,
          text: 'Aceptada',
        };
      case 'rejected':
        return {
          color: '#DC2626',
          bgColor: '#FEF2F2',
          icon: 'close-circle' as const,
          text: 'Rechazada',
        };
      default:
        return {
          color: '#F59E0B',
          bgColor: '#FFFBEB',
          icon: 'time' as const,
          text: 'Pendiente',
        };
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-sm text-gray-600">Cargando oferta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !offer) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1 px-6">
          <View className="items-center w-full p-8 bg-white rounded-2xl">
            <View className="items-center justify-center w-16 h-16 bg-red-50 rounded-xl">
              <Ionicons name="alert-circle" size={32} color="#DC2626" />
            </View>
            <Text className="mt-4 text-lg font-bold text-gray-900">
              {error || 'Oferta no encontrada'}
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

  const stateConfig = getStateConfig(offer.state);

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
            Detalle de Oferta
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View 
          className="p-3 mb-6 rounded-xl"
          style={{ backgroundColor: stateConfig.bgColor }}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name={stateConfig.icon} size={20} color={stateConfig.color} />
            <Text className="ml-2 text-sm font-semibold" style={{ color: stateConfig.color }}>
              {stateConfig.text}
            </Text>
          </View>
        </View>

        {/* Case Name */}
        <View className="p-5 mb-4 bg-white rounded-xl">
          <Text className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
            Caso
          </Text>
          <Text className="text-lg font-bold text-gray-900">
            {offer.case_name}
          </Text>
        </View>

        {/* Lawyer Name */}
        <View className="p-5 mb-4 bg-white rounded-xl">
          <View className="flex-row items-center mb-1">
            <Ionicons name="person-circle-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Abogado
            </Text>
          </View>
          <Text className="text-lg font-bold text-gray-900">
            {offer.lawyer_name}
          </Text>
        </View>

        {/* Price */}
        <View className="p-5 mb-4 bg-white rounded-xl">
          <Text className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
            Honorarios
          </Text>
          <View className="flex-row items-baseline">
            <Text className="text-3xl font-bold text-gray-900">
              ${offer.price.toLocaleString()}
            </Text>
            <Text className="ml-2 text-base font-medium text-gray-600">
              DOP
            </Text>
          </View>
        </View>

        {/* Message */}
        <View className="p-5 mb-6 bg-white rounded-xl">
          <View className="flex-row items-center mb-3">
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#6B7280" />
            <Text className="ml-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Mensaje
            </Text>
          </View>
          <Text className="text-base leading-6 text-gray-700">
            {offer.message || 'Sin mensaje'}
          </Text>
        </View>

        {/* Lawyer Profile Button */}
        {offer.state === 'accepted' && (
          <TouchableOpacity
            className="flex-row items-center justify-between p-4 mb-4 bg-indigo-600 rounded-xl"
            onPress={() =>
              router.push({
                pathname: '/client/lawyers/[caseId]',
                params: { caseId: offer.case_id },
              })
            }
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons name="person" size={20} color="white" />
              <Text className="ml-3 text-base font-semibold text-white">
                Ver Perfil del Abogado
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        )}

        {/* Locked Message */}
        {offer.state === 'sent' && (
          <View 
            className="p-4 mb-4 bg-amber-50 rounded-xl"
            style={{ borderWidth: 1, borderColor: '#FCD34D' }}
          >
            <View className="flex-row items-start">
              <Ionicons name="lock-closed" size={20} color="#F59E0B" />
              <Text className="flex-1 ml-3 text-sm font-medium text-amber-900">
                Acepta la oferta para ver el perfil del abogado
              </Text>
            </View>
          </View>
        )}

        {/* Accept Button */}
        {offer.state === 'sent' && (
          <TouchableOpacity
            className="flex-row items-center justify-center p-4 mb-4 bg-green-600 rounded-xl"
            onPress={handleAcceptOffer}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text className="ml-2 text-base font-semibold text-white">
              Aceptar Oferta
            </Text>
          </TouchableOpacity>
        )}

        {/* Status Messages */}
        {offer.state === 'accepted' && (
          <View 
            className="p-4 bg-green-50 rounded-xl"
            style={{ borderWidth: 1, borderColor: '#6EE7B7' }}
          >
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <Text className="flex-1 ml-3 text-sm font-medium text-green-900">
                Has aceptado esta oferta. El caso está en progreso con este abogado.
              </Text>
            </View>
          </View>
        )}

        {offer.state === 'rejected' && (
          <View 
            className="p-4 bg-red-50 rounded-xl"
            style={{ borderWidth: 1, borderColor: '#FCA5A5' }}
          >
            <View className="flex-row items-start">
              <Ionicons name="close-circle" size={20} color="#DC2626" />
              <Text className="flex-1 ml-3 text-sm font-medium text-red-900">
                Esta oferta fue rechazada cuando aceptaste otra oferta.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}