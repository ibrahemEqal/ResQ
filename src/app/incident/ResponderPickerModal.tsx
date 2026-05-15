import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Theme } from '@/constants/theme';

type Responder = {
  uid: string;
  fullName: string;
  email: string;
  isAvailable: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (uid: string, fullName: string) => void;
};

export function ResponderPickerModal({ visible, onClose, onSelect }: Props) {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const fetchResponders = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'responder'));
        const snapshot = await getDocs(q);
        setResponders(
          snapshot.docs.map((doc) => ({
            uid: doc.id,
            fullName: doc.data().fullName ?? '',
            email: doc.data().email ?? '',
            isAvailable: doc.data().isAvailable ?? true,
          }))
        );
      } catch (error) {
        console.log('Error fetching responders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponders();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>اختر مسؤولاً</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={Theme.colors.primary}
              style={modalStyles.loader}
            />
          ) : responders.length === 0 ? (
            <Text style={modalStyles.empty}>لا يوجد مسؤولون متاحون</Text>
          ) : (
            <FlatList
              data={responders}
              keyExtractor={(item) => item.uid}
              renderItem={({ item }) => (
                <Pressable
                  style={[modalStyles.row, !item.isAvailable && { opacity: 0.4 }]}
                  onPress={() => item.isAvailable && onSelect(item.uid, item.fullName)}
                  pointerEvents={item.isAvailable ? 'auto' : 'none'}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={modalStyles.name}>{item.fullName}</Text>
                    {!item.isAvailable && (
                      <Text style={{ color: 'red', fontSize: 12, fontWeight: '700' }}>مشغول</Text>
                    )}
                  </View>
                  <Text style={modalStyles.email}>{item.email}</Text>
                </Pressable>
              )}
            />
          )}

          <Pressable style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={modalStyles.cancelText}>إلغاء</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.radius.lg,
    borderTopRightRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    maxHeight: '70%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  loader: {
    marginVertical: Theme.spacing.lg,
  },
  empty: {
    fontSize: 15,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: Theme.spacing.lg,
  },
  row: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    textAlign: 'right',
  },
  email: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  cancelButton: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
});
