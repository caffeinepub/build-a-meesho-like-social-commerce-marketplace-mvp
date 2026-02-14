import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, Category, Order, UserProfile, OrderStatus } from '@/backend';

// Products
export function useGetProducts(category: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', category],
    queryFn: async () => {
      if (!actor) return [];
      if (category) {
        return actor.getProductsByCategory(category);
      }
      return actor.getAllProductsSortedById();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Product>({
    queryKey: ['product', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string;
      stock: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(
        data.title,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
        data.stock
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useEditProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string;
      stock: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editProduct(
        data.id,
        data.title,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
        data.stock
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Stock Management
export function useUpdateProductStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: bigint; newStock: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProductStock(data.productId, data.newStock);
    },
    onSuccess: (_, variables) => {
      // Invalidate all product-related queries to refresh stock everywhere
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId.toString()] });
    },
  });
}

// Categories
export function useGetCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

// Orders
export function useGetOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin Orders - fetch all orders for admin/seller
export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

// Update order status (admin only)
export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { orderId: bigint; newStatus: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(data.orderId, data.newStatus);
    },
    onSuccess: () => {
      // Invalidate both admin orders and buyer orders to refresh all views
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCheckout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data?: { address?: string; paymentMethod?: string; message?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.checkout(
        data?.address || null,
        data?.paymentMethod || null,
        data?.message || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Admin Bootstrap
export function useBootstrapAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { adminToken: string; userProvidedToken: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bootstrapAdmin(data.adminToken, data.userProvidedToken);
    },
    onSuccess: () => {
      // Invalidate role-related queries to refresh admin status immediately
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
    },
  });
}

// Initialize marketplace with seed data
export function useInitializeMarketplace() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['initializeMarketplace'],
    queryFn: async () => {
      if (!actor) return false;

      const categories = await actor.getAllCategories();
      if (categories.length > 0) return true;

      const seedCategories = [
        { id: BigInt(0), name: 'Fashion' },
        { id: BigInt(1), name: 'Electronics' },
        { id: BigInt(2), name: 'Home & Kitchen' },
        { id: BigInt(3), name: 'Beauty' },
        { id: BigInt(4), name: 'Sports' },
      ];

      const seedProducts = [
        {
          id: BigInt(0),
          title: 'Stylish Summer Dress',
          description: 'Comfortable and trendy summer dress perfect for any occasion',
          price: 2499,
          category: 'Fashion',
          imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(1),
          title: 'Wireless Earbuds',
          description: 'High-quality sound with noise cancellation',
          price: 3999,
          category: 'Electronics',
          imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(2),
          title: 'Cotton T-Shirt',
          description: 'Soft and breathable cotton t-shirt',
          price: 799,
          category: 'Fashion',
          imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(3),
          title: 'Smart Watch',
          description: 'Track your fitness and stay connected',
          price: 15999,
          category: 'Electronics',
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(4),
          title: 'Kitchen Blender',
          description: 'Powerful blender for smoothies and more',
          price: 6499,
          category: 'Home & Kitchen',
          imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(5),
          title: 'Face Cream',
          description: 'Moisturizing face cream for all skin types',
          price: 1999,
          category: 'Beauty',
          imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(6),
          title: 'Yoga Mat',
          description: 'Non-slip yoga mat for your workout',
          price: 2799,
          category: 'Sports',
          imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(7),
          title: 'Denim Jeans',
          description: 'Classic fit denim jeans',
          price: 3699,
          category: 'Fashion',
          imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(8),
          title: 'Bluetooth Speaker',
          description: 'Portable speaker with amazing sound',
          price: 4799,
          category: 'Electronics',
          imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(9),
          title: 'Coffee Maker',
          description: 'Brew perfect coffee every morning',
          price: 7299,
          category: 'Home & Kitchen',
          imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(10),
          title: 'Lipstick Set',
          description: 'Set of 5 vibrant lipstick shades',
          price: 1599,
          category: 'Beauty',
          imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
          stock: BigInt(100),
        },
        {
          id: BigInt(11),
          title: 'Running Shoes',
          description: 'Comfortable running shoes for athletes',
          price: 5699,
          category: 'Sports',
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          stock: BigInt(100),
        },
      ];

      await actor.createInitialMarketplace(seedProducts, seedCategories);
      return true;
    },
    enabled: !!actor && !isFetching,
    staleTime: Infinity,
  });
}
