import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { useScrollLock } from '../../hooks/use-scroll-lock';

interface TutorialOverlayProps {
  isOpen: boolean;
  onStart: () => void;
  onSkip: () => void;
}

const tutorialSteps = [
  {
    id: 1,
    title: 'Selamat Datang! 🎉',
    description:
      'Kami akan membantu Anda melengkapi profil untuk pengalaman yang lebih personal',
    icon: '👋',
    color: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'Pilih Minat Anda',
    description:
      'Pilih bidang yang Anda minati untuk mendapatkan rekomendasi yang tepat',
    icon: '💡',
    color: 'bg-green-500',
  },
  {
    id: 3,
    title: 'Tentukan Penghasilan',
    description:
      'Range penghasilan membantu kami memberikan saran investasi yang sesuai',
    icon: '💰',
    color: 'bg-yellow-500',
  },
  {
    id: 4,
    title: 'Kategori Pengeluaran',
    description:
      'Pilih kategori pengeluaran untuk analisis keuangan yang akurat',
    icon: '📊',
    color: 'bg-purple-500',
  },
];

export function TutorialOverlay({
  isOpen,
  onStart,
  onSkip,
}: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Lock scroll when tutorial is open
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStart();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isOpen) return null;

  const currentTutorial = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-md flex items-center justify-center z-[10000] p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-success/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

      <Card className="relative w-full max-w-2xl shadow-2xl border-0 bg-background/90 backdrop-blur-xl ring-1 ring-border/20">
        <CardHeader className="text-center space-y-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div
                className={`w-16 h-16 ${currentTutorial.color} text-white rounded-full flex items-center justify-center text-3xl shadow-lg`}
              >
                {currentTutorial.icon}
              </div>
            </div>
            <CardTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent font-bold">
              {currentTutorial.title}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 max-w-md mx-auto">
              {currentTutorial.description}
            </CardDescription>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-3">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-500 ${
                  index <= currentStep
                    ? 'bg-gradient-primary'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tutorial Content */}
          <div className="text-center space-y-6">
            <div className="p-8 rounded-2xl border border-gray-200">
              <div className="text-6xl mb-4">{currentTutorial.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">
                {currentTutorial.title}
              </h3>
              <p className="text-gray-600 text-lg">
                {currentTutorial.description}
              </p>
            </div>

            {/* Step-specific content */}
            {currentStep === 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary"
                  >
                    Step 1
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Pilih minat investasi Anda
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Badge variant="outline" className="bg-accent/10 text-accent">
                    Step 2
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Tentukan range penghasilan
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Badge
                    variant="outline"
                    className="bg-warning/10 text-warning"
                  >
                    Step 3
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Pilih kategori pengeluaran
                  </span>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-blue-100 rounded text-blue-800">
                    Investasi Saham
                  </div>
                  <div className="p-2 bg-blue-100 rounded text-blue-800">
                    Trading Forex
                  </div>
                  <div className="p-2 bg-blue-100 rounded text-blue-800">
                    Investasi Emas
                  </div>
                  <div className="p-2 bg-blue-100 rounded text-blue-800">
                    Tabungan
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Pilih semua yang sesuai dengan minat Anda
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="p-3 bg-green-100 rounded text-green-800">
                    Rp 0 - 5 juta
                  </div>
                  <div className="p-3 bg-green-100 rounded text-green-800">
                    Rp 5 - 10 juta
                  </div>
                  <div className="p-3 bg-green-100 rounded text-green-800">
                    Rp 10 - 20 juta
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Pilih satu range yang paling sesuai
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-purple-100 rounded text-purple-800">
                    Makanan
                  </div>
                  <div className="p-2 bg-purple-100 rounded text-purple-800">
                    Transportasi
                  </div>
                  <div className="p-2 bg-purple-100 rounded text-purple-800">
                    Belanja
                  </div>
                  <div className="p-2 bg-purple-100 rounded text-purple-800">
                    Hiburan
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Pilih semua kategori yang biasanya Anda gunakan
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t-2 border-gradient-to-r from-gray-200 to-gray-300">
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="px-6 py-2 border-2 border-border hover:border-primary hover:bg-primary/80 transition-all duration-300"
                >
                  ← Sebelumnya
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300"
              >
                Lewati Tutorial
              </Button>
            </div>

            <Button
              onClick={handleNext}
              className="px-8 py-3 text-lg font-semibold bg-gradient-primary hover:shadow-primary transition-all duration-500 shadow-lg"
            >
              {isLastStep ? (
                <div className="flex items-center space-x-2">
                  <span>Mulai Mengisi Profil 🚀</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Selanjutnya</span>
                  <span>→</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
