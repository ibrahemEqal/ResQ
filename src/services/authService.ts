import { User, UserRole } from '../types';

const USE_MOCK_DATA = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_USER: User = {
  uid: 'user-123',
  fullName: 'وجدان',
  email: 'student@najah.edu',
  universityId: '12217661',
  role: 'student', 
};

export const login = async (email: string, password: string): Promise<User> => {
  if (USE_MOCK_DATA) {
    await delay(1500); 
    if (email === 'test@test.com' && password === '123456') {
      return MOCK_USER;
    }
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  } else {
    throw new Error('Firebase not implemented yet');
  }
};

export const signup = async (userData: any): Promise<User> => {
  if (USE_MOCK_DATA) {
    await delay(2000);
    return { ...MOCK_USER, ...userData, uid: `new-user-${Date.now()}` };
  } else {
    throw new Error('Firebase not implemented yet');
  }
};

export const resetPassword = async (email: string): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    await delay(1000);
    return true; 
  } else {
    throw new Error('Firebase not implemented yet');
  }
};