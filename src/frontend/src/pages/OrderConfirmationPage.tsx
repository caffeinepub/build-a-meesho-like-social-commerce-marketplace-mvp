import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Package, Receipt } from 'lucide-react';
import { getDemoTransactionId } from '@/components/checkout/demoPaymentReference';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order-confirmation/$orderId' });
  const navigate = useNavigate();

  const transactionId = getDemoTransactionId(orderId);

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Thank you for your order. We'll send you a confirmation email
              shortly.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-mono font-semibold">#{orderId}</p>
              </div>
            </div>

            {transactionId && (
              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    Transaction Reference
                  </p>
                  <p className="font-mono font-semibold text-sm">
                    {transactionId}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

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
