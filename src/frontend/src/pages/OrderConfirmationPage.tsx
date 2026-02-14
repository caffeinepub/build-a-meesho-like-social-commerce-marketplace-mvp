import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center space-y-6">
          <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">
              Your order #{orderId} has been confirmed
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => navigate({ to: '/orders' })}
              className="w-full"
              size="lg"
            >
              View My Orders
            </Button>
            <Button
              onClick={() => navigate({ to: '/' })}
              variant="outline"
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
