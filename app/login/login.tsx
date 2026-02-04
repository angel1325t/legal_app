import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
  if (!validateForm()) return;

  setLoading(true);
  try {
    const result = await login({ email, password });

    if (result.status === 'blocked') {
      Alert.alert(
        'Cuenta de abogado',
        'Esta cuenta pertenece a un abogado. Usa la app de abogados.'
      );
      return;
    }

    if (result.status === 'invalid') {
      Alert.alert(
        'Error de Inicio de Sesión',
        result.message
      );
      return;
    }
  } catch (error: any) {
    Alert.alert(
      'Error de Inicio de Sesión',
      error.message || 'Error inesperado'
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="justify-center flex-1 px-6">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute top-4 left-6"
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>

            {/* Header */}
            <View className="items-center mb-10">
              <View className="p-6 mb-4 bg-blue-600 rounded-full">
                <Ionicons name="person" size={48} color="white" />
              </View>
              <Text className="mb-2 text-3xl font-bold text-gray-800">
                Bienvenido Cliente
              </Text>
              <Text className="text-center text-gray-500">
                Inicia sesión para buscar abogados
              </Text>
            </View>

            {/* Form */}
            <View>
              <Input
                label="Email"
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={errors.email}
              />

              <Input
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                isPassword
                icon="lock-closed-outline"
                error={errors.password}
              />

              <TouchableOpacity className="self-end mb-6">
                <Text className="font-medium text-blue-600">
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              <Button
                title="Iniciar Sesión"
                onPress={handleLogin}
                loading={loading}
              />
            </View>

            {/* Register */}
            <View className="items-center mt-8">
              <Text className="mb-4 text-gray-600">¿No tienes cuenta?</Text>

              <TouchableOpacity
                className="px-8 py-3 bg-blue-600 rounded-xl"
                onPress={() => router.push('/login/register-client')}
              >
                <Text className="text-base font-semibold text-white">
                  Registrarse como Cliente
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
