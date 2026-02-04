  import React, { useState, useEffect } from 'react';
  import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
  } from 'react-native';
  import { useRouter } from 'expo-router';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { Ionicons } from '@expo/vector-icons';
  import { useAuth } from '../../context/AuthContext';
  import caseService from '../../services/casesService';
  import offersService from '../../services/offerService';
  import BottomNavigationBar from '@/components/BottomNavigationBar';

  interface CaseWithOffersCount {
    id: number;
    name: string;
    description: string;
    categories: string[];
    stage: string;
    offersCount: number;
    hasPendingOffers: boolean;
  }

  export default function CasesScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [cases, setCases] = useState<CaseWithOffersCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      fetchCases();
    }, []);

    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await caseService.listCases();

        if (response.success && response.data) {
          // Para cada caso, obtener el conteo de ofertas
          const casesWithOffers = await Promise.all(
            response.data.map(async (caseItem) => {
              const offersResponse = await offersService.listCaseOffers(caseItem.id);
              
              const offersCount = offersResponse.data?.length || 0;
              const hasPendingOffers = offersResponse.data?.some(o => o.state === 'sent') || false;

              return {
                ...caseItem,
                categories: caseItem.categories ?? [],
                offersCount,
                hasPendingOffers,
              };
            })
          );

          setCases(casesWithOffers);
        } else {
          setError(response.error || 'No se pudieron cargar los casos');
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
      fetchCases();
    };

    const renderCase = (caseItem: CaseWithOffersCount) => (
      <View
        key={caseItem.id}
        className="p-4 mb-4 bg-white border border-gray-200 shadow-sm rounded-xl"
      >
        {/* Case Header */}
        <TouchableOpacity
          onPress={() =>
    router.push({
      pathname: "/client/offers/[caseId]",
      params: { caseId: caseItem.id },
    })
  }

        >
          <Text className="mb-2 text-lg font-bold text-gray-900">
            {caseItem.name}
          </Text>
          
          <Text className="mb-3 text-sm text-gray-600" numberOfLines={2}>
            {caseItem.description}
          </Text>

          <View className="flex-row items-center mb-3">
            <View className="flex-row flex-wrap mb-3">
  {caseItem.categories.map((cat) => (
    <View
      key={cat}
      className="px-3 py-1 mb-2 mr-2 bg-indigo-100 rounded-full"
    >
      <Text className="text-xs font-semibold text-indigo-800">
        {cat}
      </Text>
    </View>
  ))}

  <View className="px-3 py-1 mb-2 bg-gray-100 rounded-full">
    <Text className="text-xs font-semibold text-gray-700">
      {caseItem.stage}
    </Text>
  </View>
</View>

            
            <View className="px-3 py-1 bg-gray-100 rounded-full">
              <Text className="text-xs font-semibold text-gray-700">
                {caseItem.stage}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Offers Button */}
        <TouchableOpacity
          className={`flex-row items-center justify-between p-3 rounded-lg border ${
            caseItem.hasPendingOffers 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}
          onPress={() =>
    router.push({
      pathname: "/client/offers/[caseId]",
      params: { caseId: caseItem.id },
    })
  }
        >
          <View className="flex-row items-center flex-1">
            <Ionicons 
              name="briefcase-outline" 
              size={20} 
              color={caseItem.hasPendingOffers ? '#10B981' : '#6B7280'} 
            />
            <Text className={`ml-2 font-semibold ${
              caseItem.hasPendingOffers ? 'text-green-700' : 'text-gray-700'
            }`}>
              Ver Ofertas
            </Text>
          </View>

          <View className="flex-row items-center">
            {caseItem.offersCount > 0 && (
              <View className={`px-2 py-1 rounded-full mr-2 ${
                caseItem.hasPendingOffers ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                <Text className="text-xs font-bold text-white">
                  {caseItem.offersCount}
                </Text>
              </View>
            )}
            {caseItem.hasPendingOffers && (
              <View className="px-2 py-1 mr-2 bg-green-500 rounded-full">
                <Text className="text-xs font-bold text-white">NUEVO</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      </View>
    );

    if (loading) {
      return (
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="mt-4 text-gray-600">Cargando casos...</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-2xl font-bold text-gray-900">Mis Casos</Text>
            <TouchableOpacity onPress={() => router.push('/client/profile')}>
              <View className="p-2 bg-gray-100 rounded-full">
                <Ionicons name="person" size={20} color="#4F46E5" />
              </View>
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-600">
            {user?.name || 'Cliente'}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
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
                onPress={fetchCases}
              >
                <Text className="font-semibold text-white">Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : cases.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
              <Text className="mt-4 text-xl font-semibold text-gray-900">
                Sin Casos
              </Text>
              <Text className="px-8 mt-2 text-center text-gray-600">
                Aún no tienes casos creados
              </Text>
              <TouchableOpacity
                className="px-6 py-3 mt-6 bg-indigo-600 rounded-lg"
                onPress={() => router.push('/client/home')}
              >
                <Text className="font-semibold text-white">Crear Caso</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cases.map(renderCase)
          )}
        </ScrollView>

        <BottomNavigationBar />
      </SafeAreaView>
    );
  }