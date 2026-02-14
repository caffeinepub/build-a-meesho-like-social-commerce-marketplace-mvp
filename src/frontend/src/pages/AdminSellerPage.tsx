import { useState } from 'react';
import { useGetProducts, useAddProduct, useEditProduct, useDeleteProduct, useBootstrapAdmin, useGetAllOrders, useUpdateOrderStatus } from '@/hooks/useQueries';
import RequireAuth from '@/components/auth/RequireAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, ShieldAlert, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, Order, OrderStatus } from '@/backend';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AdminProductManagementHelp from '@/components/admin/AdminProductManagementHelp';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/utils/currency';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSellerPage() {
  return (
    <RequireAuth>
      <AdminContent />
    </RequireAuth>
  );
}

function AdminContent() {
  const { isAdmin, isLoading: userLoading } = useCurrentUser();
  const { data: products, isLoading: productsLoading } = useGetProducts(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const bootstrapAdmin = useBootstrapAdmin();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleBootstrapAdmin = async () => {
    try {
      // Use empty strings as tokens for the bootstrap call
      await bootstrapAdmin.mutateAsync({
        adminToken: '',
        userProvidedToken: '',
      });
      toast.success('You are now an admin! You can now manage products.');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to become admin';
      if (errorMessage.includes('already been bootstrapped')) {
        toast.error('An admin already exists. Please contact the existing administrator for access.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Show loading state while checking admin status
  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  // Show admin bootstrap option for non-admin users
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Admin Access Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>
              This page is restricted to administrators only. Admin permissions are required to add, edit, or delete products in the marketplace.
            </p>
            <p>
              If no admin exists yet, you can become the first admin by clicking the button below. If an admin already exists, you will need to contact them for access.
            </p>
            <Button
              onClick={handleBootstrapAdmin}
              disabled={bootstrapAdmin.isPending}
              className="gap-2 mt-4"
              variant="default"
            >
              <ShieldCheck className="h-4 w-4" />
              {bootstrapAdmin.isPending ? 'Processing...' : 'Make my account an admin'}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Product Management</TabsTrigger>
          <TabsTrigger value="orders">Order Management</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Products</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </DialogTitle>
                </DialogHeader>
                <ProductForm
                  product={editingProduct}
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    setEditingProduct(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <AdminProductManagementHelp />

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <p>Loading products...</p>
              ) : (
                <ProductTable
                  products={products || []}
                  onEdit={handleEdit}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrderManagement() {
  const { data: orders, isLoading } = useGetAllOrders();
  const updateOrderStatus = useUpdateOrderStatus();

  const handleAccept = async (orderId: bigint) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId,
        newStatus: 'accepted' as OrderStatus,
      });
      toast.success('Order accepted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept order');
    }
  };

  const handleDecline = async (orderId: bigint) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId,
        newStatus: 'declined' as OrderStatus,
      });
      toast.success('Order declined successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline order');
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'accepted':
      case 'delivered':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'declined':
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const truncatePrincipal = (principal: string): string => {
    if (principal.length <= 16) return principal;
    return `${principal.slice(0, 8)}...${principal.slice(-8)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No orders yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Delivery Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const isPending = order.status === 'pending';
                const isProcessing = updateOrderStatus.isPending;
                
                return (
                  <TableRow key={order.id.toString()}>
                    <TableCell className="font-medium">#{order.id.toString()}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {truncatePrincipal(order.userId.toString())}
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell className="font-semibold">{formatINR(order.total)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {order.address ? order.address.split('\n')[0] : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isPending ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAccept(order.id)}
                            disabled={isProcessing}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDecline(order.id)}
                            disabled={isProcessing}
                            className="gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No actions</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
}

function ProductForm({ product, onSuccess }: ProductFormProps) {
  const addProduct = useAddProduct();
  const editProduct = useEditProduct();
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price.toString() || '',
    category: product?.category || '',
    imageUrl: product?.imageUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (product) {
        await editProduct.mutateAsync({
          id: product.id,
          ...formData,
          price: parseFloat(formData.price),
        });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync({
          ...formData,
          price: parseFloat(formData.price),
        });
        toast.success('Product added successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={addProduct.isPending || editProduct.isPending}
      >
        {addProduct.isPending || editProduct.isPending
          ? 'Saving...'
          : product
            ? 'Update Product'
            : 'Add Product'}
      </Button>
    </form>
  );
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
}

function ProductTable({ products, onEdit }: ProductTableProps) {
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Product deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id.toString()}>
              <TableCell>{product.id.toString()}</TableCell>
              <TableCell className="font-medium">{product.title}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{formatINR(product.price)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteProduct.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
