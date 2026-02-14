import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Store, Package, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthControls from '../auth/AuthControls';
import { useCartItemCount } from '@/hooks/useCart';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function HeaderBar() {
  const navigate = useNavigate();
  const { itemCount } = useCartItemCount();
  const { isAdmin } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/assets/generated/logo-wordmark.dim_512x192.png" 
              alt="Marketplace Logo" 
              className="h-8 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Shop
            </Link>
            <Link to="/orders" className="text-sm font-medium hover:text-primary transition-colors">
              Orders
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden md:flex"
              onClick={() => navigate({ to: '/cart' })}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
            <AuthControls />
          </div>
        </div>
      </div>
    </header>
  );
}
