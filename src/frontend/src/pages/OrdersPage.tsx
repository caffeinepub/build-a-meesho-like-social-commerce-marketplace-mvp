import { useGetOrders } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';
import RequireAuth from '@/components/auth/RequireAuth';
import { formatINR } from '@/utils/currency';

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useGetOrders();

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (error) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-destructive">Failed to load orders</p>
        </div>
      </RequireAuth>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <RequireAuth>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <Package className="h-24 w-24 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">No orders yet</h2>
              <p className="text-muted-foreground">
                Your order history will appear here
              </p>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id.toString()}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.id.toString()}
                  </CardTitle>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                    {order.address && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Delivery to: {order.address.split('\n')[0]}
                      </p>
                    )}
                  </div>
                  <p className="text-xl font-bold text-primary">
                    {formatINR(order.total)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}
