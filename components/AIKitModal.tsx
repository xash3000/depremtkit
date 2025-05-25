import React from 'react';
import { Modal, SafeAreaView, StatusBar } from 'react-native';
import AIKitForm from './AIKitForm';

interface AIKitModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AIKitModal({ visible, onClose, onSuccess }: AIKitModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="default" />
        <AIKitForm
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </SafeAreaView>
    </Modal>
  );
}
