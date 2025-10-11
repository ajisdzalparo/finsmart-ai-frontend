import React from 'react';
import SubscriptionModal from './SubscriptionModal';

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function SubscriptionPopup({
  isOpen,
  onClose,
  title = 'Pilih Paket yang Tepat untuk Anda',
  subtitle = 'Anda telah mencapai batas maksimal untuk fitur ini. Upgrade untuk akses unlimited!',
}: SubscriptionPopupProps) {
  return (
    <SubscriptionModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      showCurrentPlan={true}
    />
  );
}
