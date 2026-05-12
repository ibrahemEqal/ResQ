import { auth } from '@/config/firebaseConfig';
import { Redirect } from 'expo-router';

export default function Index() {

  const user = auth.currentUser;

  if (user) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/auth/login" />;
}