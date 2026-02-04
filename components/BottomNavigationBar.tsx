// CLIENT APP - components/BottomNavigationBar.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BottomNavigationBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  type IconName = 'home-outline' | 'document-text-outline' | 'person-outline';

  type Tab = {
    name: string;
    icon: IconName;
    route: '/client/home' | '/client/cases' | '/client/profile';
  };

  const tabs: Tab[] = [
    { name: 'Inicio', icon: 'home-outline', route: '/client/home' },
    { name: 'Casos', icon: 'document-text-outline', route: '/client/cases' },
    { name: 'Perfil', icon: 'person-outline', route: '/client/profile' },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row justify-around py-3 bg-white border-t border-gray-200">
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={tab.name}
            className="items-center px-6 py-2"
            onPress={() => {
              if (!isActive) {
                router.push(tab.route);
              }
            }}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={isActive ? '#2563eb' : '#6B7280'}
            />
            <Text
              className={`mt-1 text-xs ${isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}`}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavigationBar;