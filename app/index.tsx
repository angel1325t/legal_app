// app/index.tsx

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
  if (isLoading) return;

  if (isAuthenticated && user) {
    router.replace('/client/home');
  } else {
    router.replace('/splash/splash');
  }
}, [router, isAuthenticated, isLoading, user]);


  return <LoadingSpinner fullScreen />;
}
