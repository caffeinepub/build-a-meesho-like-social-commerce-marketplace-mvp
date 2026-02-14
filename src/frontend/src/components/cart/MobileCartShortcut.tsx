import { useNavigate } from '@tanstack/react-router';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartItemCount } from '@/hooks/useCart';

export default function MobileCartShortcut() {
  const navigate = useNavigate();
  const { itemCount } = useCartItemCount();

  if (itemCount === 0) return null;

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-40">
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg relative"
        onClick={() => navigate({ to: '/cart' })}
      >
        <ShoppingCart className="h-6 w-6" />
        <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0">
          {itemCount}
        </Badge>
      </Button>
    </div>
  );
}
