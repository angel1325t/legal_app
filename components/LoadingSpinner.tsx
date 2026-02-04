import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'large',
  color = '#2563eb', // azul tailwind (blue-600)
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <View
      className={`items-center justify-center ${
        fullScreen ? 'flex-1 bg-white' : ''
      }`}
    >
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
