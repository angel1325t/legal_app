// CLIENT APP - components/RatingComment.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rating } from '../services/ratingService';

interface RatingCommentProps {
  rating: Rating;
}

export default function RatingComment({ rating }: RatingCommentProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = () => {
    return (
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating.score ? 'star' : 'star-outline'}
            size={14}
            color="#F59E0B"
          />
        ))}
      </View>
    );
  };

  return (
    <View 
      className="p-4 mb-3 bg-white rounded-xl"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Header with stars and date */}
      <View className="flex-row items-center justify-between mb-3">
        {renderStars()}
        <Text className="text-xs text-gray-500">
          {formatDate(rating.created_at)}
        </Text>
      </View>

      {/* Comment */}
      {rating.comment && (
        <Text className="mb-2 text-sm leading-5 text-gray-700">
          {rating.comment}
        </Text>
      )}

      {/* Case name */}
      <View className="flex-row items-center pt-2 border-t border-gray-100">
        <Ionicons name="document-text-outline" size={14} color="#6B7280" />
        <Text className="ml-1.5 text-xs text-gray-600">
          {rating.case_name}
        </Text>
      </View>
    </View>
  );
}