// app/screens/login/register-client.tsx

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

export default function RegisterClientScreen() {
  const router = useRouter();
  const { registerClient } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
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
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await registerClient({ name, email, password });
      Alert.alert(
        '¡Registro Exitoso! ✅',
        'Tu cuenta ha sido creada correctamente.',
        [{ text: 'OK' }]
      );
      // El AuthContext y index.tsx redirigirán automáticamente
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo registrar. Intenta nuevamente.'
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
          <View className="flex-1 px-6 pt-4 pb-6">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6"
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-8">
              <Text className="mb-2 text-3xl font-bold text-gray-800">
                Registro de Cliente
              </Text>
              <Text className="text-gray-500">
                Crea tu cuenta para buscar abogados
              </Text>
            </View>

            {/* Form */}
            <View>
              <Input
                label="Nombre Completo"
                placeholder="Juan Pérez"
                value={name}
                onChangeText={setName}
                icon="person-outline"
                error={errors.name}
              />

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

              <Input
                label="Confirmar Contraseña"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                icon="lock-closed-outline"
                error={errors.confirmPassword}
              />

              <Button
                title="Registrarse"
                onPress={handleRegister}
                loading={loading}
              />

              <TouchableOpacity
                className="items-center mt-6"
                onPress={() => router.push('/login/login')}
              >
                <Text className="text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <Text className="font-semibold text-blue-600">
                    Inicia Sesión
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}