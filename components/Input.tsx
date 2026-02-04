import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  error,
  isPassword,
}: InputProps) => {
  const [secure, setSecure] = useState(isPassword);

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center px-4 py-3 border rounded-xl ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color="#6B7280"
            style={{ marginRight: 8 }}
          />
        )}

        <TextInput
          className="flex-1 text-gray-800"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secure}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      )}
    </View>
  );
};
