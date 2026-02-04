// CLIENT APP - components/CaseOffersButton.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface CaseOffersButtonProps {
  caseId: number;
  offersCount?: number;
  hasNewOffers?: boolean;
}

export default function CaseOffersButton({ 
  caseId, 
  offersCount = 0,
  hasNewOffers = false 
}: CaseOffersButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between p-4 bg-white border border-gray-200 rounded-xl"
      onPress={() =>
  router.push({
    pathname: '/client/offers/[caseId]',
    params: { caseId },
  })
}

      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className={`p-3 rounded-full ${hasNewOffers ? 'bg-green-100' : 'bg-indigo-100'}`}>
          <Ionicons 
            name="document-text" 
            size={24} 
            color={hasNewOffers ? '#10B981' : '#4F46E5'} 
          />
        </View>
        
        <View className="flex-1 ml-4">
          <Text className="text-base font-semibold text-gray-900">
            Ofertas Recibidas
          </Text>
          <Text className="mt-1 text-sm text-gray-600">
            {offersCount === 0 
              ? 'No hay ofertas aún' 
              : `${offersCount} oferta${offersCount > 1 ? 's' : ''} disponible${offersCount > 1 ? 's' : ''}`
            }
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        {hasNewOffers && (
          <View className="px-2 py-1 mr-2 bg-green-500 rounded-full">
            <Text className="text-xs font-bold text-white">NUEVO</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}