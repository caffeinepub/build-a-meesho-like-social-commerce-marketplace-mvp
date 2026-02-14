import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { CartItem, Product } from '@/backend';

interface CartItemWithProduct {
  product: Product;
  quantity: bigint;
}

export function useCart() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const cartQuery = useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getCart();
    },
    enabled: !!actor && !!identity && !isFetching,
  });

  const productsQuery = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProductsSortedById();
    },
    enabled: !!actor && !isFetching,
  });

  const cartItems: CartItemWithProduct[] = (cartQuery.data || [])
    .map((item) => {
      const product = productsQuery.data?.find(
        (p) => p.id.toString() === item.productId.toString()
      );
      if (!product) return null;
      return { product, quantity: item.quantity };
    })
    .filter((item): item is CartItemWithProduct => item !== null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * Number(item.quantity),
    0
  );

  return {
    cartItems,
    isLoading: cartQuery.isLoading || productsQuery.isLoading,
    error: cartQuery.error || productsQuery.error,
    subtotal,
  };
}

export function useCartItemCount() {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  return { itemCount };
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(data.productId, data.quantity);
    },
    onSuccess: () => {
      // Invalidate cart and products to refresh stock-aware UI
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateCartQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(data.productId, data.quantity);
    },
    onSuccess: () => {
      // Invalidate cart and products to refresh stock-aware UI
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(productId, BigInt(0));
    },
    onSuccess: () => {
      // Invalidate cart and products to refresh stock-aware UI
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
