import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = Math.floor(Math.random() * 30) + 10; // Mock discount for visual appeal

  return (
    <Link
      to="/product/$productId"
      params={{ productId: product.id.toString() }}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {discount && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              {discount}% OFF
            </Badge>
          )}
        </div>
        <CardContent className="p-3 space-y-1">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {discount && (
              <span className="text-xs text-muted-foreground line-through">
                ${(product.price * (1 + discount / 100)).toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{product.category}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
