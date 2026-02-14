import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct } from '@/hooks/useQueries';
import { useAddToCart } from '@/hooks/useCart';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, Plus, ShoppingCart, ArrowLeft, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatINR } from '@/utils/currency';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProductDetailsPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: product, isLoading, error } = useGetProduct(BigInt(productId));
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error('Please sign in to add items to cart');
      await login();
      return;
    }

    if (!product) return;

    // Client-side validation: check if quantity exceeds stock
    if (quantity > Number(product.stock)) {
      toast.error(`We have only ${product.stock} in stock at this moment.`);
      return;
    }

    try {
      await addToCart.mutateAsync({
        productId: BigInt(productId),
        quantity: BigInt(quantity),
      });
      toast.success('Added to cart!');
    } catch (error: any) {
      // Backend will also enforce stock limits and return clear error messages
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleIncrement = () => {
    if (!product) return;
    
    const newQuantity = quantity + 1;
    if (newQuantity > Number(product.stock)) {
      toast.error(`We have only ${product.stock} in stock at this moment.`);
      return;
    }
    setQuantity(newQuantity);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive">Product not found</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Back to Store
        </Button>
      </div>
    );
  }

  const stockLevel = Number(product.stock);
  const isOutOfStock = stockLevel === 0;
  const isLowStock = stockLevel > 0 && stockLevel < 10;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Store
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <Badge variant="secondary">{product.category}</Badge>
            </div>
            <p className="text-3xl font-bold text-primary">
              {formatINR(product.price)}
            </p>
          </div>

          {/* Stock Status Alert */}
          {isOutOfStock && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This product is currently out of stock.
              </AlertDescription>
            </Alert>
          )}

          {isLowStock && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only {stockLevel} left in stock!
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                  disabled={isOutOfStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={addToCart.isPending || isOutOfStock}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isOutOfStock
                ? 'Out of Stock'
                : addToCart.isPending
                ? 'Adding...'
                : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
