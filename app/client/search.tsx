// app/screens/client/search.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const LAWYERS = [
  { id: 1, name: 'Dr. Juan Pérez', specialty: 'Civil', rating: 4.8, cases: 150, price: '$100/hora' },
  { id: 2, name: 'Dra. María García', specialty: 'Penal', rating: 4.9, cases: 200, price: '$120/hora' },
  { id: 3, name: 'Dr. Carlos López', specialty: 'Laboral', rating: 4.7, cases: 120, price: '$90/hora' },
  { id: 4, name: 'Dra. Ana Martínez', specialty: 'Familiar', rating: 4.6, cases: 180, price: '$110/hora' },
  { id: 5, name: 'Dr. Pedro Rodríguez', specialty: 'Mercantil', rating: 4.8, cases: 160, price: '$130/hora' },
];

const FILTERS = ['Todos', 'Civil', 'Penal', 'Laboral', 'Familiar', 'Mercantil'];

export default function SearchLawyersScreen() {
  const router = useRouter();
  
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const renderLawyer = ({ item }: any) => (
    <TouchableOpacity
      className="p-5 mx-4 mb-4 bg-white shadow-sm rounded-2xl"
      activeOpacity={0.8}
    >
      <View className="flex-row">
        <View className="items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl">
          <Ionicons name="person" size={32} color="#2563eb" />
        </View>
        
        <View className="flex-1 ml-4">
          <Text className="mb-1 text-lg font-bold text-gray-800">
            {item.name}
          </Text>
          <Text className="mb-2 text-sm text-gray-500">
            {item.specialty}
          </Text>
          
          <View className="flex-row items-center space-x-4">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#EAB308" />
              <Text className="ml-1 font-semibold text-gray-700">{item.rating}</Text>
            </View>
            <Text className="text-sm text-gray-500">• {item.cases} casos</Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-4 mt-4 border-t border-gray-100">
        <Text className="text-lg font-bold text-blue-600">{item.price}</Text>
        <TouchableOpacity className="px-6 py-2 bg-blue-600 rounded-xl">
          <Text className="font-semibold text-white">Contactar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-4 pb-4 bg-white">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">
            Buscar Abogados
          </Text>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center p-4 mb-4 bg-gray-100 rounded-xl">
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-800"
            placeholder="Buscar por nombre o especialidad..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`px-4 py-2 rounded-xl mr-2 ${
                selectedFilter === filter
                  ? 'bg-blue-600'
                  : 'bg-gray-100'
              }`}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                className={`font-semibold ${
                  selectedFilter === filter
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <View className="flex-1 mt-4">
        <Text className="px-6 mb-3 text-gray-500">
          {LAWYERS.length} abogados encontrados
        </Text>
        <FlatList
          data={LAWYERS}
          renderItem={renderLawyer}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}