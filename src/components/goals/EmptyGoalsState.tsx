import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, PlusCircle } from 'lucide-react';

interface EmptyGoalsStateProps {
  onCreateGoal: () => void;
}

export function EmptyGoalsState({ onCreateGoal }: EmptyGoalsStateProps) {
  return (
    <Card className="shadow-card">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
          <p className="text-muted-foreground max-w-md">
            Start your financial journey by creating your first goal. Set
            targets, track progress, and achieve your dreams!
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onCreateGoal}
            className="bg-primary shadow-primary hover:shadow-elevated"
            size="lg"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Your First Goal
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>Popular goal types:</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              <span className="px-2 py-1 bg-muted rounded text-xs">
                🏠 Emergency Fund
              </span>
              <span className="px-2 py-1 bg-muted rounded text-xs">
                ✈️ Vacation
              </span>
              <span className="px-2 py-1 bg-muted rounded text-xs">
                🚗 Vehicle
              </span>
              <span className="px-2 py-1 bg-muted rounded text-xs">
                🎓 Education
              </span>
              <span className="px-2 py-1 bg-muted rounded text-xs">
                📈 Investment
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
