// CLIENT APP - app/client/home.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import CreateCaseDialog from '../../components/dialogs/CreateCaseDialog';
import categoryService from '../../services/categoryService';       
import { addStylesToCategories, LegalCategory } from '../../constants/categories'; 
import BottomNavigationBar from '@/components/BottomNavigationBar';

const FEATURED_LAWYERS = [
  { id: 1, name: 'Dr. Juan Pérez', specialty: 'Civil', rating: 4.8, cases: 150, price: '$100/hr' },
  { id: 2, name: 'Dra. María García', specialty: 'Penal', rating: 4.9, cases: 200, price: '$120/hr' },
  { id: 3, name: 'Dr. Carlos López', specialty: 'Laboral', rating: 4.7, cases: 120, price: '$90/hr' },
];

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
      className={`mr-4 px-5 py-3 rounded-full ${item.color || 'bg-gray-500'}`}
      activeOpacity={0.8}
      onPress={() => {
        // Opcional: filtrar abogados por categoría
        // router.push(`/client/search?category=${item.id}`);
        console.log('Categoría seleccionada:', item.name);
      }}
    >
      <View className="flex-row items-center space-x-2">
        <Ionicons name={(item.icon || 'document-text') as any} size={20} color="white" />
        <Text className="font-medium text-white">{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLawyer = ({ item }: any) => (
    <TouchableOpacity
      className="p-4 mr-4 bg-white border border-gray-100 shadow-sm rounded-xl w-72"
      onPress={() => router.push(`/`)} // ← corrige esto cuando tengas la ruta real
    >
      <Text className="text-lg font-bold">{item.name}</Text>
      <Text className="text-gray-600">{item.specialty}</Text>
      <View className="flex-row items-center mt-1">
        <Ionicons name="star" size={16} color="#F59E0B" />
        <Text className="ml-1">{item.rating} • {item.cases} casos</Text>
      </View>
      <Text className="mt-2 font-medium text-indigo-600">{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
          <View>
            <Text className="text-2xl font-bold">Hola, {user?.name || 'Cliente'}</Text>
            <Text className="mt-1 text-gray-600">¿En qué podemos ayudarte hoy?</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/client/profile')}>
            <View className="p-3 bg-gray-100 rounded-full">
              <Ionicons name="person" size={24} color="#4F46E5" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          className="flex-row items-center px-4 py-3 mx-6 mb-6 bg-white rounded-full shadow-sm"
          onPress={() => router.push('/client/search')}
        >
          <Ionicons name="search" size={20} color="gray" />
          <Text className="flex-1 ml-3 text-gray-500">Buscar abogados...</Text>
        </TouchableOpacity>

        {/* Categories */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="text-xl font-bold">Especialidades Legales</Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text className="text-indigo-600">Ver todas</Text>
            </TouchableOpacity>
          </View>

          {loadingCategories ? (
            <Text className="px-6 text-gray-500">Cargando categorías...</Text>
          ) : error ? (
            <Text className="px-6 text-red-500">{error}</Text>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            />
          )}
        </View>

        {/* Featured Lawyers */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="text-xl font-bold">Abogados Destacados</Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text className="text-indigo-600">Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={FEATURED_LAWYERS}
            renderItem={renderLawyer}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-8">
          <Text className="mb-4 text-xl font-bold">Acciones Rápidas</Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity
              className="items-center flex-1 p-5 bg-indigo-100 rounded-xl"
              onPress={() => router.push('/client/cases')}
            >
              <Ionicons name="folder-open" size={32} color="#4F46E5" />
              <Text className="mt-3 font-medium text-indigo-800">Mis Casos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center flex-1 p-5 bg-purple-100 rounded-xl"
              onPress={() => router.push('/')}
            >
              <Ionicons name="chatbubbles" size={32} color="#7C3AED" />
              <Text className="mt-3 font-medium text-purple-800">Mensajes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute items-center justify-center w-16 h-16 bg-indigo-600 rounded-full shadow-lg bottom-[100] right-6"
        onPress={() => setCreateCaseVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
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