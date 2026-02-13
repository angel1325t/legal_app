import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import caseService, { Case } from '../../services/casesService';
import offersService from '../../services/offerService';
import CaseCard from '../../components/CaseCard';
import BottomNavigationBar from '@/components/BottomNavigationBar';

// ============================================================================
// Component
// ============================================================================

export default function CasesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await caseService.listCases();

      if (response.success && response.data) {
        setCases(response.data);
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

  // ==========================================================================
  // Case Actions
  // ==========================================================================

  const handleCasePress = (caseId: number) => {
    router.push({
      pathname: "/client/offers/[caseId]",
      params: { caseId },
    });
  };

  const handleEditCase = (caseId: number) => {
    router.push({
      pathname: "/client/cases/edit/[caseId]",
      params: { caseId },
    });
  };

  const handleCancelCase = async (caseId: number) => {
    try {
      const response = await caseService.cancelCase(caseId);
      
      if (response.success) {
        Alert.alert('Éxito', 'Caso cancelado exitosamente');
        fetchCases(); // Recargar la lista
      } else {
        Alert.alert('Error', response.error || 'No se pudo cancelar el caso');
      }
    } catch (err) {
      Alert.alert('Error', 'Error al cancelar el caso');
      console.error(err);
    }
  };

  const handleCloseCase = async (caseId: number) => {
    try {
      const response = await caseService.closeCase(caseId);
      
      if (response.success) {
        Alert.alert('Éxito', 'Caso cerrado exitosamente');
        fetchCases(); // Recargar la lista
      } else {
        Alert.alert('Error', response.error || 'No se pudo cerrar el caso');
      }
    } catch (err) {
      Alert.alert('Error', 'Error al cerrar el caso');
      console.error(err);
    }
  };

  const handleRateCase = (caseItem: Case) => {
    router.push({
      pathname: "/client/rate/[caseId]",
      params: { 
        caseId: caseItem.id,
        caseName: caseItem.name,
      },
    });
  };

  // ==========================================================================
  // Loading State
  // ==========================================================================

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
          <Text className="mt-6 text-base font-semibold text-gray-700">
            Cargando casos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100">
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-2xl font-bold text-gray-900">Mis Casos</Text>
            <TouchableOpacity
              onPress={() => router.push('/client/home')}
              className="items-center justify-center w-10 h-10 bg-indigo-600 rounded-xl"
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
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
        {/* Error State */}
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
                onPress={fetchCases}
                activeOpacity={0.8}
              >
                <Text className="font-bold text-white">Reintentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : cases.length === 0 ? (
          /* Empty State */
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
              <View className="items-center justify-center w-20 h-20 bg-indigo-100 rounded-2xl">
                <Ionicons name="folder-open-outline" size={48} color="#4F46E5" />
              </View>
              <Text className="mt-6 text-2xl font-bold text-gray-900">
                Sin Casos
              </Text>
              <Text className="mt-3 text-base leading-6 text-center text-gray-600">
                Aún no tienes casos creados
              </Text>
              <TouchableOpacity
                className="px-6 py-3 mt-6 bg-indigo-600 rounded-xl"
                onPress={() => router.push('/client/home')}
                activeOpacity={0.8}
              >
                <Text className="font-bold text-white">Crear Caso</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Cases List */
          <>
            {cases.map((caseItem) => (
              <CaseCard
                key={caseItem.id}
                case={caseItem}
                onPress={() => handleCasePress(caseItem.id)}
                onEdit={() => handleEditCase(caseItem.id)}
                onCancel={() => handleCancelCase(caseItem.id)}
                onClose={() => handleCloseCase(caseItem.id)}
                onRate={() => handleRateCase(caseItem)}
              />
            ))}
            <View className="h-6" />
          </>
        )}
      </ScrollView>

      <BottomNavigationBar />
    </SafeAreaView>
  );
}