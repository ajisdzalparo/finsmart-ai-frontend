import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AICategorizationFeature from '@/components/subscription/AICategorizationFeature';
import SchedulerFeature from '@/components/subscription/SchedulerFeature';

export default function AIFeatures() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Fitur AI & Otomasi</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Manfaatkan kecerdasan buatan untuk mengelola keuangan Anda dengan
          lebih efisien dan akurat
        </p>
      </div>

      <AICategorizationFeature />

      <SchedulerFeature />
    </div>
  );
}
