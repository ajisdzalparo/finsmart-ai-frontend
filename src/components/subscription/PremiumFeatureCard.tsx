import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Sparkles, ArrowRight, Check } from 'lucide-react';
import SubscriptionPopup from './SubscriptionPopup';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface PremiumFeatureCardProps {
  feature: string;
  title: string;
  description: string;
  requiredPlan: 'premium' | 'enterprise';
  icon?: React.ReactNode;
  benefits?: string[];
  className?: string;
  children?: React.ReactNode;
}

export default function PremiumFeatureCard({
  feature,
  title,
  description,
  requiredPlan,
  icon,
  benefits = [],
  className = '',
  children,
}: PremiumFeatureCardProps) {
  const { hasAccess } = useFeatureAccess();
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const userHasAccess = hasAccess(feature, requiredPlan);

  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case 'premium':
        return {
          name: 'Premium',
          color: 'from-blue-500 to-purple-600',
          bgColor: 'from-blue-50 to-purple-50',
          borderColor: 'border-blue-200',
          icon: <Crown className="h-5 w-5" />,
          price: 'Rp 99.000',
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          color: 'from-purple-500 to-pink-600',
          bgColor: 'from-purple-50 to-pink-50',
          borderColor: 'border-purple-200',
          icon: <Sparkles className="h-5 w-5" />,
          price: 'Rp 299.000',
        };
      default:
        return {
          name: 'Premium',
          color: 'from-blue-500 to-purple-600',
          bgColor: 'from-blue-50 to-purple-50',
          borderColor: 'border-blue-200',
          icon: <Crown className="h-5 w-5" />,
          price: 'Rp 99.000',
        };
    }
  };

  const planInfo = getPlanInfo(requiredPlan);

  if (userHasAccess) {
    return (
      <Card
        className={`border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300 ${className}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {icon || <Crown className="h-6 w-6 text-green-600" />}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            <Badge
              variant="default"
              className="bg-green-500 hover:bg-green-600"
            >
              <Check className="h-3 w-3 mr-1" />
              Aktif
            </Badge>
          </div>
          {children}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={`relative overflow-hidden border-2 ${planInfo.borderColor} bg-gradient-to-br ${planInfo.bgColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            planInfo.color
          } opacity-5 transition-opacity duration-300 ${
            isHovered ? 'opacity-10' : ''
          }`}
        />

        {/* Lock overlay */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <Lock className="h-4 w-4 text-gray-600" />
          </div>
        </div>

        <CardContent className="p-6 relative z-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg bg-gradient-to-r ${planInfo.color} text-white`}
              >
                {icon || planInfo.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/80 text-gray-700">
              {planInfo.name}
            </Badge>
          </div>

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Fitur yang akan Anda dapatkan:
              </h4>
              <ul className="space-y-1">
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disabled content */}
          <div className="opacity-60 pointer-events-none mb-6">{children}</div>

          {/* Upgrade CTA */}
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Upgrade ke{' '}
                <span className="font-semibold text-gray-900">
                  {planInfo.name}
                </span>{' '}
                untuk mengakses fitur ini
              </p>
              <div className="text-2xl font-bold text-gray-900">
                {planInfo.price}
                <span className="text-sm font-normal text-gray-500">
                  /bulan
                </span>
              </div>
            </div>

            <Button
              onClick={() => setShowSubscriptionPopup(true)}
              className={`w-full bg-gradient-to-r ${planInfo.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade ke {planInfo.name}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
      />
    </>
  );
}
