import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionPopup from '@/components/subscription/SubscriptionPopup';

interface OCRScanButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
}

const OCRScanButton = React.forwardRef<HTMLButtonElement, OCRScanButtonProps>(
  ({ onClick, className = '', variant = 'outline', ...props }, ref) => {
    const { canUseFeature } = useSubscription();
    const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

    const hasAccess = canUseFeature('ocr_scan');

    const handleClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
      if (hasAccess && onClick) {
        onClick(event);
      } else if (!hasAccess) {
        setShowSubscriptionPopup(true);
      }
    };

    return (
      <>
        <Button
          ref={ref}
          variant={variant}
          className={`gap-2 ${className} ${
            !hasAccess ? 'relative' : ''
          } dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700`}
          onClick={handleClick}
          {...props}
        >
          {hasAccess ? (
            <Camera className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          Scan Nota
          {!hasAccess && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              ⭐
            </span>
          )}
        </Button>

        <SubscriptionPopup
          isOpen={showSubscriptionPopup}
          onClose={() => setShowSubscriptionPopup(false)}
        />
      </>
    );
  },
);

OCRScanButton.displayName = 'OCRScanButton';

export default OCRScanButton;
