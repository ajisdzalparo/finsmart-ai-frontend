import React from 'react';
import SubscriptionModal from './SubscriptionModal';

interface SubscriptionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionOverlay({
  isOpen,
  onClose,
}: SubscriptionOverlayProps) {
  return (
    <SubscriptionModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Paket Langganan"
      subtitle="Upgrade untuk akses fitur lengkap"
      showCurrentPlan={true}
    />
  );
}
