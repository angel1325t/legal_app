import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export const Button = ({ title, onPress, loading }: ButtonProps) => {
  return (
    <TouchableOpacity
      disabled={loading}
      onPress={onPress}
      className={`py-4 rounded-xl items-center ${
        loading ? 'bg-blue-400' : 'bg-blue-600'
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-base font-semibold text-white">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
