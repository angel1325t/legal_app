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
import offersService, { OfferDetail, CaseLawyer } from '../../../../services/offerService';

export default function OfferDetailScreen() {
  const router = useRouter();
  const { offerId } = useLocalSearchParams();
  
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [lawyer, setLawyer] = useState<CaseLawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLawyer, setLoadingLawyer] = useState(false);
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
                offer.case_id,
                offer.id
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

  const getStateColor = (state: string) => {
    switch (state) {
      case 'accepted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
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

  const renderLawyerInfo = () => {
  if (offer?.state !== 'accepted') {
    return (
      <View className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <Text className="text-sm text-yellow-800">
          Acepta la oferta para ver el perfil del abogado
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      className="flex-row items-center justify-center p-4 bg-indigo-600 rounded-lg"
      onPress={() =>
        router.push({
          pathname: '/client/lawyers/[caseId]',
          params: { 
            caseId: offer.case_id
          },
        })
      }
    >
      <Ionicons name="person-outline" size={20} color="white" />
      <Text className="ml-2 font-semibold text-white">
        Ver Perfil del Abogado
      </Text>
    </TouchableOpacity>
  );
};


  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-gray-600">Cargando detalle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !offer) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1 px-6">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="mt-4 text-xl font-semibold text-gray-900">
            Error
          </Text>
          <Text className="mt-2 text-center text-gray-600">
            {error || 'No se pudo cargar la oferta'}
          </Text>
          <TouchableOpacity
            className="px-6 py-3 mt-6 bg-indigo-600 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="font-semibold text-white">Volver</Text>
          </TouchableOpacity>
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
          Detalle de Oferta
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Status Badge */}
        <View className="items-center mb-6">
          <View className={`px-6 py-2 rounded-full ${getStateColor(offer.state)}`}>
            <Text className="text-lg font-bold text-white">
              {getStateText(offer.state)}
            </Text>
          </View>
        </View>

        {/* Case Info */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
          <Text className="mb-2 text-sm text-gray-500">Caso Relacionado</Text>
          <Text className="text-lg font-bold text-gray-900">
            {offer.case_name}
          </Text>
        </View>

        {/* Lawyer & Price */}
        <View className="p-5 mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
          <Text className="mb-1 text-sm text-indigo-100">Abogado</Text>
          <Text className="mb-4 text-2xl font-bold text-white">
            {offer.lawyer_name}
          </Text>
          
          <View className="pt-4 border-t border-indigo-400">
            <Text className="mb-1 text-sm text-indigo-100">Honorarios Propuestos</Text>
            <Text className="text-3xl font-bold text-white">
              ${offer.price.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Message */}
        <View className="p-4 mb-4 bg-white border border-gray-200 rounded-xl">
          <Text className="mb-3 text-lg font-bold text-gray-900">
            Mensaje del Abogado
          </Text>
          <Text className="text-base leading-6 text-gray-700">
            {offer.message || 'Sin mensaje'}
          </Text>
        </View>

        {/* Lawyer Information Section */}
        <View className="mb-6">
          {renderLawyerInfo()}
        </View>

        {/* Accept Button (only for pending offers) */}
        {offer.state === 'sent' && (
          <TouchableOpacity
            className="flex-row items-center justify-center px-6 py-4 bg-green-500 shadow-lg rounded-xl"
            onPress={handleAcceptOffer}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text className="ml-3 text-lg font-bold text-white">
              Aceptar Oferta
            </Text>
          </TouchableOpacity>
        )}

        {/* Additional Info for Accepted Offers */}
        {offer.state === 'accepted' && (
          <View className="p-4 border border-green-200 rounded-lg bg-green-50">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text className="flex-1 ml-3 text-sm text-green-800">
                Has aceptado esta oferta. El caso está ahora en progreso con este abogado.
              </Text>
            </View>
          </View>
        )}

        {/* Additional Info for Rejected Offers */}
        {offer.state === 'rejected' && (
          <View className="p-4 border border-red-200 rounded-lg bg-red-50">
            <View className="flex-row items-center">
              <Ionicons name="close-circle" size={24} color="#EF4444" />
              <Text className="flex-1 ml-3 text-sm text-red-800">
                Esta oferta fue rechazada cuando aceptaste otra oferta.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}