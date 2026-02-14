import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DemoPaymentDisclaimer() {
  return (
    <Card className="bg-muted/50 border-muted">
      <div className="p-3 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium">Demo payment only</p>
          <p className="text-xs mt-0.5">No real money is processed. This is a demonstration of the checkout flow.</p>
        </div>
      </div>
    </Card>
  );
}
