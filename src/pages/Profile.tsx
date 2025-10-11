import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import { useState } from 'react';
import SubscriptionPopup from '@/components/subscription/SubscriptionPopup';

export default function Profile() {
  const { user } = useAuth();
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Kelola informasi profil Anda.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Full Name</Label>
                <div className="text-sm p-2 rounded border bg-muted/20">
                  {user?.name || '-'}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email Address</Label>
                <div className="text-sm p-2 rounded border bg-muted/20 break-all">
                  {user?.email || '-'}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Income Range</Label>
                <div className="text-sm p-2 rounded border bg-muted/20">
                  {(user as any)?.incomeRange || '-'}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Profile Completed</Label>
                <div className="text-sm p-2 rounded border bg-muted/20">
                  {(user as any)?.profileCompleted ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-2">
                {Array.isArray((user as any)?.interests) &&
                (user as any)?.interests.length > 0 ? (
                  (user as any).interests.map((it: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded border bg-muted/20"
                    >
                      {it}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expense Categories</Label>
              <div className="flex flex-wrap gap-2">
                {Array.isArray((user as any)?.expenseCategories) &&
                (user as any)?.expenseCategories.length > 0 ? (
                  (user as any).expenseCategories.map(
                    (cat: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded border bg-muted/20"
                      >
                        {cat}
                      </span>
                    ),
                  )
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <SubscriptionCard onUpgrade={() => setShowSubscriptionPopup(true)} />
      </div>

      {/* Subscription Popup */}
      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
      />
    </div>
  );
}
