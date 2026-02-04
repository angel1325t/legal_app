// CLIENT APP - app/screens/profile.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationBar from '@/components/BottomNavigationBar';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/splash/splash');
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, onPress, color = 'text-gray-800', showArrow = true, badge }: any) => (
    <TouchableOpacity
      className="flex-row items-center justify-between p-4 mb-3 bg-white shadow-sm rounded-2xl"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className="p-3 bg-gray-100 rounded-xl">
          <Ionicons name={icon} size={24} color="#2563eb" />
        </View>
        <Text className={`ml-4 font-semibold text-base ${color}`}>
          {title}
        </Text>
        {badge && (
          <View className="px-2 py-1 ml-2 bg-red-500 rounded-full">
            <Text className="text-xs font-bold text-white">{badge}</Text>
          </View>
        )}
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">
              Mi Perfil
            </Text>
          </View>

          {/* Profile Header */}
<View className="p-5 bg-white shadow-sm rounded-3xl">
  <View className="flex-row items-center">
    
    {/* Avatar */}
    <View className="items-center justify-center w-16 h-16 mr-4 bg-blue-100 rounded-full">
      <Ionicons name="person" size={28} color="#2563eb" />
    </View>

    {/* User Info */}
    <View className="flex-1">
      <Text className="text-lg font-semibold text-gray-900">
        {user?.name || 'Usuario'}
      </Text>

      <Text
        className="text-sm text-gray-500 mt-0.5"
        numberOfLines={1}
      >
        {user?.email || user?.login}
      </Text>

      <Text className="mt-1 text-xs font-medium text-blue-600">
        Cliente
      </Text>
    </View>
  </View>
</View>

        </View>

        {/* Menu Items */}
        <View className="px-6">
          <Text className="mb-3 ml-1 font-semibold text-gray-500">
            MI CUENTA
          </Text>
          
          <MenuItem
            icon="person-outline"
            title="Editar Perfil"
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            title="Mis Casos"
            onPress={() => {}}
            badge="3"
          />
          <MenuItem
            icon="chatbubbles-outline"
            title="Mensajes"
            onPress={() => {}}
            badge="5"
          />
          <MenuItem
            icon="heart-outline"
            title="Abogados Favoritos"
            onPress={() => {}}
          />
          <MenuItem
            icon="time-outline"
            title="Historial"
            onPress={() => {}}
          />

          <Text className="mt-6 mb-3 ml-1 font-semibold text-gray-500">
            CONFIGURACIÓN
          </Text>
          
          <MenuItem
            icon="notifications-outline"
            title="Notificaciones"
            onPress={() => {}}
          />
          <MenuItem
            icon="card-outline"
            title="Métodos de Pago"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacidad y Seguridad"
            onPress={() => {}}
          />
          <MenuItem
            icon="help-circle-outline"
            title="Ayuda y Soporte"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-circle-outline"
            title="Acerca de"
            onPress={() => {}}
          />

          <Text className="mt-6 mb-3 ml-1 font-semibold text-gray-500">
            SESIÓN
          </Text>
          
          <MenuItem
            icon="log-out-outline"
            title="Cerrar Sesión"
            onPress={handleLogout}
            color="text-red-600"
            showArrow={false}
          />
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}