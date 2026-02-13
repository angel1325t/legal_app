// CLIENT APP - app/client/home.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import CreateCaseDialog from '../../components/dialogs/CreateCaseDialog';
import categoryService from '../../services/categoryService';       
import { addStylesToCategories, LegalCategory } from '../../constants/categories'; 
import BottomNavigationBar from '@/components/BottomNavigationBar';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [createCaseVisible, setCreateCaseVisible] = useState(false);
  const [categories, setCategories] = useState<LegalCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoryService.listCategories();

        if (response.success && response.data) {
          const styledCategories = addStylesToCategories(response.data);
          setCategories(styledCategories);
        } else {
          setError(response.error || 'No se pudieron cargar las categorías');
        }
      } catch (err) {
        setError('Error al conectar con el servidor');
        console.error(err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateCaseSuccess = () => {
    router.push('/client/cases');
  };

  const renderCategory = ({ item }: { item: LegalCategory }) => (
    <TouchableOpacity
      className="mr-3"
      activeOpacity={0.85}
      onPress={() => {
        console.log('Categoría seleccionada:', item.name);
      }}
    >
      <View 
        className={`overflow-hidden rounded-2xl ${item.color || 'bg-gray-500'}`}
        style={{
          width: 160,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View className="p-5">
          <View className="items-center justify-center w-14 h-14 mb-3 bg-white/30 rounded-2xl">
            <Ionicons name={(item.icon || 'document-text') as any} size={28} color="white" />
          </View>
          <Text className="text-base font-bold text-white leading-5">
            {item.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Bienvenido
          </Text>
          <Text className="mt-1 text-3xl font-bold text-gray-900">
            {user?.name || 'Cliente'}
          </Text>
          <Text className="mt-2 text-base text-gray-600">
            Encuentra el apoyo legal que necesitas
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            className="flex-row items-center px-5 py-4 bg-white rounded-2xl"
            onPress={() => router.push('/client/search')}
            activeOpacity={0.9}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="items-center justify-center w-10 h-10 mr-3 bg-indigo-100 rounded-xl">
              <Ionicons name="search" size={20} color="#4F46E5" />
            </View>
            <Text className="flex-1 text-base font-medium text-gray-500">
              Buscar abogados especializados...
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 overflow-hidden bg-white rounded-2xl"
              onPress={() => router.push('/client/cases')}
              activeOpacity={0.85}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="p-5">
                <View className="items-center justify-center w-12 h-12 mb-3 bg-indigo-100 rounded-xl">
                  <Ionicons name="folder-open" size={24} color="#4F46E5" />
                </View>
                <Text className="text-base font-bold text-gray-900">Mis Casos</Text>
                <Text className="mt-1 text-sm text-gray-600">Ver y gestionar</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 overflow-hidden bg-white rounded-2xl"
              onPress={() => router.push('/')}
              activeOpacity={0.85}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="p-5">
                <View className="items-center justify-center w-12 h-12 mb-3 bg-purple-100 rounded-xl">
                  <Ionicons name="chatbubbles" size={24} color="#7C3AED" />
                </View>
                <Text className="text-base font-bold text-gray-900">Mensajes</Text>
                <Text className="mt-1 text-sm text-gray-600">Conversaciones</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
<View className="mb-8">
  <View className="px-6 mb-5">
    <Text className="text-2xl font-bold text-gray-900">Especialidades</Text>
    <Text className="mt-2 text-base text-gray-600">
      Encuentra expertos en cada área del derecho
    </Text>
  </View>

  {loadingCategories ? (
    <View className="px-6 py-8">
      <View 
        className="items-center justify-center p-10 bg-white rounded-3xl"
        style={{
          shadowColor: '#4F46E5',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="items-center justify-center w-20 h-20 mb-5 bg-indigo-50 rounded-3xl">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
        <Text className="text-lg font-bold text-gray-900">
          Cargando especialidades
        </Text>
        <Text className="mt-2 text-sm text-gray-500">
          Esto solo tomará un momento...
        </Text>
      </View>
    </View>
  ) : error ? (
    <View className="px-6">
      <View 
        className="overflow-hidden bg-gradient-to-br rounded-3xl"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="p-8 bg-white">
          <View className="flex-row items-start">
            <View className="items-center justify-center w-16 h-16 mr-5 bg-orange-100 rounded-2xl">
              <Ionicons name="warning" size={32} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">
                Algo salió mal
              </Text>
              <Text className="mt-2 text-base text-gray-600 leading-6">
                {error}
              </Text>
              <TouchableOpacity
                className="px-6 py-3 mt-5 bg-indigo-600 rounded-xl self-start"
                onPress={() => {
                  setLoadingCategories(true);
                  setError(null);
                  // Aquí llamarías a fetchCategories() de nuevo
                }}
                activeOpacity={0.85}
                style={{
                  shadowColor: '#4F46E5',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="refresh" size={18} color="white" />
                  <Text className="ml-2 text-base font-bold text-white">
                    Intentar de nuevo
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  ) : categories.length === 0 ? (
    <View className="px-6">
      <View 
        className="items-center p-10 bg-white rounded-3xl"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="items-center justify-center w-24 h-24 mb-5 bg-gray-100 rounded-3xl">
          <Ionicons name="briefcase-outline" size={48} color="#9CA3AF" />
        </View>
        <Text className="text-xl font-bold text-gray-900">
          No hay especialidades
        </Text>
        <Text className="mt-3 text-base text-center text-gray-600 leading-6 px-4">
          Aún no hay especialidades disponibles. Vuelve pronto
        </Text>
      </View>
    </View>
  ) : (
    <FlatList
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ 
        paddingHorizontal: 24,
        paddingVertical: 4,
      }}
    />
  )}
</View>

        {/* Main CTA Banner */}
        <View className="px-6 mb-8">
          <View 
            className="overflow-hidden bg-indigo-600 rounded-3xl"
            style={{
              shadowColor: '#4F46E5',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="p-8">
              <View className="items-center justify-center w-16 h-16 mb-5 bg-indigo-500 rounded-2xl">
                <Ionicons name="briefcase" size={32} color="white" />
              </View>
              
              <Text className="text-3xl font-bold text-white leading-9">
                ¿Necesitas ayuda legal?
              </Text>
              <Text className="mt-3 text-base text-indigo-100 leading-6">
                Describe tu situación y recibe propuestas de abogados especializados en minutos
              </Text>

              <TouchableOpacity
                className="px-8 py-4 mt-6 bg-white rounded-2xl"
                onPress={() => setCreateCaseVisible(true)}
                activeOpacity={0.85}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="add-circle" size={24} color="#4F46E5" />
                  <Text className="ml-3 text-lg font-bold text-indigo-600">
                    Publicar Caso
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* How it works */}
        <View className="px-6 mb-8">
          <View className="mb-5">
            <Text className="text-2xl font-bold text-gray-900">¿Cómo funciona?</Text>
            <Text className="mt-2 text-base text-gray-600">
              Proceso simple y transparente
            </Text>
          </View>
          
          {/* Step 1 */}
          <View 
            className="flex-row items-start p-5 mb-3 bg-white rounded-2xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="items-center justify-center w-12 h-12 mr-4 bg-green-100 rounded-xl">
              <Text className="text-xl font-bold text-green-700">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">Publica tu caso</Text>
              <Text className="mt-2 text-base text-gray-600 leading-6">
                Describe tu situación legal y selecciona la especialidad que necesitas
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View 
            className="flex-row items-start p-5 mb-3 bg-white rounded-2xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="items-center justify-center w-12 h-12 mr-4 bg-blue-100 rounded-xl">
              <Text className="text-xl font-bold text-blue-700">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">Recibe ofertas</Text>
              <Text className="mt-2 text-base text-gray-600 leading-6">
                Abogados calificados te enviarán propuestas con honorarios y plan de trabajo
              </Text>
            </View>
          </View>

          {/* Step 3 */}
          <View 
            className="flex-row items-start p-5 bg-white rounded-2xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="items-center justify-center w-12 h-12 mr-4 bg-purple-100 rounded-xl">
              <Text className="text-xl font-bold text-purple-700">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">Elige y trabaja</Text>
              <Text className="mt-2 text-base text-gray-600 leading-6">
                Compara opciones, selecciona la mejor y comienza a resolver tu caso
              </Text>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View className="px-6 mb-8">
          <View 
            className="p-6 bg-amber-50 rounded-2xl"
            style={{ borderWidth: 1, borderColor: '#FCD34D' }}
          >
            <View className="flex-row items-start">
              <View className="items-center justify-center w-12 h-12 mr-4 bg-white rounded-xl">
                <Ionicons name="shield-checkmark" size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-amber-900">
                  Proceso seguro y confiable
                </Text>
                <Text className="mt-2 text-sm text-amber-800 leading-5">
                  Todos nuestros abogados están verificados y cuentan con licencia profesional vigente
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl bottom-[100] right-6"
        onPress={() => setCreateCaseVisible(true)}
        activeOpacity={0.85}
        style={{
          shadowColor: '#4F46E5',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <CreateCaseDialog
        visible={createCaseVisible}
        onClose={() => setCreateCaseVisible(false)}
        onSuccess={handleCreateCaseSuccess}
      />
      <BottomNavigationBar/>
    </SafeAreaView>
  );
}