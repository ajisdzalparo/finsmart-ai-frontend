import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SchedulerFeature from '@/components/subscription/SchedulerFeature';

export default function Scheduler() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SchedulerFeature />
    </div>
  );
}
