import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }),
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 8,
      friction: 3,
      useNativeDriver: true,
    }),
  ]).start();

  const timeout = setTimeout(() => {
    router.replace('/login/login');
  }, 2200);

  return () => clearTimeout(timeout);
}, [fadeAnim, scaleAnim, router]);

  return (
    <SafeAreaView className="flex-1 bg-blue-700">
      <View className="items-center justify-center flex-1 px-6">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="items-center"
        >
          <View className="p-6 mb-6 bg-white shadow-2xl rounded-3xl">
            <Ionicons name="briefcase-outline" size={72} color="#1d4ed8" />
          </View>

          <Text className="mb-2 text-4xl font-extrabold text-white">
            LegalApp
          </Text>

          <Text className="text-base text-center text-blue-200">
            Asistencia legal rápida y confiable
          </Text>
        </Animated.View>

        {/* Loader fake */}
        <View className="absolute bottom-24">
          <Text className="tracking-widest text-blue-200">
            CARGANDO...
          </Text>
        </View>

        <Text className="absolute text-xs text-blue-300 bottom-8">
          v1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}
