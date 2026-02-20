import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import offersService, { Offer } from '../../../services/offerService';

export default function OffersScreen() {
  const router = useRouter();
  const { caseId } = useLocalSearchParams();
  const viewedRequestIds = useRef<Set<number>>(new Set());

  const [offers, setOffers] = useState<Offer[]>([]);
  const [sortOption, setSortOption] = useState<'date_desc' | 'price_asc' | 'price_desc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await offersService.listCaseOffers(Number(caseId));
      
      if (response.success && response.data) {
        setOffers(response.data);
        setCurrentPage(0);
        viewedRequestIds.current.clear();
      } else {
        setError(response.error || 'No se pudieron cargar las ofertas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

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

  const handleToggleFavorite = async (offer: Offer) => {
    try {
      setUpdatingFavoriteId(offer.id);
      const response = await offersService.setOfferFavorite(offer.id, !offer.is_favorite);
      if (!response.success || !response.data) {
        Alert.alert('Error', response.error || 'No se pudo actualizar favorito');
        return;
      }

      setOffers((current) =>
        current.map((item) => (item.id === offer.id ? { ...item, ...response.data } : item))
      );
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar favorito');
      console.error(err);
    } finally {
      setUpdatingFavoriteId(null);
    }
  };

  const sortedOffers = useMemo(() => {
    const items = [...offers];
    if (sortOption === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
      return items;
    }
    if (sortOption === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
      return items;
    }

    items.sort((a, b) => {
      const left = a.created_at ? new Date(a.created_at).getTime() : 0;
      const right = b.created_at ? new Date(b.created_at).getTime() : 0;
      return right - left;
    });
    return items;
  }, [offers, sortOption]);

  const pagedOffers = useMemo(() => {
    const pageSize = 4;
    const pages: Offer[][] = [];
    for (let i = 0; i < sortedOffers.length; i += pageSize) {
      pages.push(sortedOffers.slice(i, i + pageSize));
    }
    return pages;
  }, [sortedOffers]);

  const markPageAsViewed = useCallback(async (pageOffers: Offer[]) => {
    const toMark = pageOffers.filter(
      (offer) => !offer.viewed_at && !viewedRequestIds.current.has(offer.id)
    );
    if (toMark.length === 0) return;

    toMark.forEach((offer) => viewedRequestIds.current.add(offer.id));
    const responses = await Promise.all(
      toMark.map(async (offer) => {
        const response = await offersService.setOfferViewed(offer.id, true);
        return { id: offer.id, response };
      })
    );

    setOffers((current) => {
      let next = current;
      responses.forEach(({ id, response }) => {
        if (response.success && response.data) {
          next = next.map((item) => (item.id === id ? { ...item, ...response.data } : item));
          return;
        }
        viewedRequestIds.current.delete(id);
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (pagedOffers.length === 0) return;
    const safePage = Math.min(currentPage, pagedOffers.length - 1);
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
      return;
    }

    markPageAsViewed(pagedOffers[safePage]);
  }, [currentPage, markPageAsViewed, pagedOffers]);

  const handlePageSelected = (event: PagerViewOnPageSelectedEvent) => {
    const page = event.nativeEvent.position || 0;
    setCurrentPage(page);
    const pageOffers = pagedOffers[page];
    if (!pageOffers) return;
    markPageAsViewed(pageOffers);
  };

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return 'Sin fecha';
    return new Date(isoDate).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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
            <Text className="mt-2 text-xs text-gray-500">
              Fecha: {formatDate(offer.created_at)}
            </Text>
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

        {/* Client Flags */}
        <View className="flex-row mb-4">
          <View
            className={`px-3 py-1 mr-2 rounded-lg ${
              offer.viewed_at ? 'bg-green-100' : 'bg-amber-100'
            }`}
          >
            <Text className={`text-xs font-semibold ${offer.viewed_at ? 'text-green-700' : 'text-amber-700'}`}>
              {offer.viewed_at ? 'Visto' : 'No visto'}
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-lg ${offer.is_favorite ? 'bg-pink-100' : 'bg-gray-100'}`}
          >
            <Text className={`text-xs font-semibold ${offer.is_favorite ? 'text-pink-700' : 'text-gray-600'}`}>
              {offer.is_favorite ? 'Favorito' : 'Sin favorito'}
            </Text>
          </View>
        </View>

        {/* Favorite Toggle */}
        <View className="mb-3">
          <TouchableOpacity
            className={`flex-row items-center justify-center px-4 py-3 rounded-xl ${
              offer.is_favorite ? 'bg-pink-100' : 'bg-rose-100'
            }`}
            onPress={() => handleToggleFavorite(offer)}
            activeOpacity={0.8}
            disabled={updatingFavoriteId === offer.id}
          >
            <Ionicons
              name={offer.is_favorite ? 'heart-dislike-outline' : 'heart-outline'}
              size={16}
              color={offer.is_favorite ? '#BE185D' : '#9F1239'}
            />
            <Text className={`ml-2 font-semibold ${offer.is_favorite ? 'text-pink-700' : 'text-rose-700'}`}>
              {offer.is_favorite ? 'Quitar favorito' : 'Agregar favorito'}
            </Text>
          </TouchableOpacity>
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
          <TouchableOpacity
            onPress={() => router.push('/client/offers/favorites')}
            className="items-center justify-center w-10 h-10 bg-pink-100 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={20} color="#BE185D" />
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View className="items-center justify-center flex-1 px-5">
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
        <View className="items-center justify-center flex-1 px-5">
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
        <View className="flex-1">
          {/* Sort + Story Header */}
          <View className="px-5 pt-4 pb-2">
            <View className="p-4 mb-3 bg-white rounded-2xl">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold text-gray-700">Ordenar por</Text>
                <TouchableOpacity onPress={fetchOffers} className="px-3 py-1 bg-gray-100 rounded-lg">
                  <Text className="text-xs font-semibold text-gray-700">Actualizar</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setSortOption('date_desc')}
                  className={`px-3 py-2 rounded-lg ${sortOption === 'date_desc' ? 'bg-indigo-600' : 'bg-gray-100'}`}
                >
                  <Text className={`font-semibold ${sortOption === 'date_desc' ? 'text-white' : 'text-gray-700'}`}>
                    Fecha
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortOption('price_asc')}
                  className={`px-3 py-2 rounded-lg ${sortOption === 'price_asc' ? 'bg-indigo-600' : 'bg-gray-100'}`}
                >
                  <Text className={`font-semibold ${sortOption === 'price_asc' ? 'text-white' : 'text-gray-700'}`}>
                    Monto ↑
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSortOption('price_desc')}
                  className={`px-3 py-2 rounded-lg ${sortOption === 'price_desc' ? 'bg-indigo-600' : 'bg-gray-100'}`}
                >
                  <Text className={`font-semibold ${sortOption === 'price_desc' ? 'text-white' : 'text-gray-700'}`}>
                    Monto ↓
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-2">
              <View className="flex-row gap-2">
                {pagedOffers.map((_, index) => (
                  <View
                    key={`story-step-${index}`}
                    className={`h-1.5 flex-1 rounded-full ${index === currentPage ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  />
                ))}
              </View>
              <Text className="mt-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Página {currentPage + 1} de {pagedOffers.length} • 4 ofertas por slide
              </Text>
            </View>
          </View>

          <PagerView
            style={{ flex: 1 }}
            initialPage={0}
            onPageSelected={handlePageSelected}
          >
            {pagedOffers.map((pageItems, pageIndex) => (
              <View key={`offers-page-${pageIndex}`} className="flex-1 px-5">
                <ScrollView
                  className="flex-1"
                  contentContainerStyle={{ paddingBottom: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  {pageItems.map(renderOffer)}
                </ScrollView>
              </View>
            ))}
          </PagerView>
        </View>
      )}
    </SafeAreaView>
  );
}
