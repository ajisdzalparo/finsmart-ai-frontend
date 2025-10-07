import React, { useState, useEffect } from 'react';
import { ProfileCompletionWizard } from './dialogs/ProfileCompletionWizard';
import { TutorialOverlay } from './dialogs/TutorialOverlay';
import { useCompleteProfileMutation } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';

export function ProfileCompletionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const { user, token } = useAuth();
  const completeProfileMutation = useCompleteProfileMutation();
  const { toast } = useToast();

  useEffect(() => {
    // Jika profileCompleted sudah true, tidak tampilkan tutorial atau dialog sama sekali
    if (user && token && user.profileCompleted === true) {
      setShowTutorial(false);
      setShowProfileDialog(false);
      return;
    }

    if (user && token && user.profileCompleted === false) {
      const tutorialSeen = localStorage.getItem('tutorialSeen');

      if (!tutorialSeen) {
        // Tampilkan tutorial untuk user baru
        setShowTutorial(true);
      } else {
        // Langsung tampilkan dialog profil
        setShowProfileDialog(true);
      }
    }
  }, [user, token]);

  const handleCompleteProfile = async (data: {
    interests: string[];
    incomeRange: string;
    expenseCategories: string[];
  }) => {
    try {
      await completeProfileMutation.mutateAsync(data);
      setShowProfileDialog(false);
      toast({
        title: 'Berhasil',
        description: 'Profil Anda telah dilengkapi',
      });
      // Refresh halaman untuk update data user
      window.location.reload();
    } catch (error) {
      console.error('Error completing profile:', error);
      throw error;
    }
  };

  const handleSkip = () => {
    setShowProfileDialog(false);
    toast({
      title: 'Info',
      description: 'Anda dapat melengkapi profil nanti di pengaturan',
    });
  };

  const handleTutorialStart = () => {
    setShowTutorial(false);
    setShowProfileDialog(true);
    localStorage.setItem('tutorialSeen', 'true');
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setShowProfileDialog(true);
    localStorage.setItem('tutorialSeen', 'true');
  };

  return (
    <>
      {children}
      <TutorialOverlay
        isOpen={showTutorial}
        onStart={handleTutorialStart}
        onSkip={handleTutorialSkip}
      />
      <ProfileCompletionWizard
        isOpen={showProfileDialog}
        onComplete={handleCompleteProfile}
        onSkip={handleSkip}
      />
    </>
  );
}
