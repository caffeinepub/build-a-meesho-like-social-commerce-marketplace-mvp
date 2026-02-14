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
import AdminStockManagementSection from '@/components/admin/AdminStockManagementSection';
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
          <TabsTrigger value="stock">Stock Management</TabsTrigger>
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

        <TabsContent value="stock">
          {productsLoading ? (
            <p>Loading products...</p>
          ) : (
            <AdminStockManagementSection products={products || []} />
          )}
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

  if (isLoading) {
    return <p>Loading orders...</p>;
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No orders yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id.toString()}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
              <Badge variant={getStatusVariant(order.status)}>
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Customer</p>
                <p className="font-mono text-sm">{order.userId.toString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-lg font-bold text-primary">{formatINR(order.total)}</p>
              </div>
            </div>

            {order.address && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                <p className="text-sm whitespace-pre-line">{order.address}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Items</p>
              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm flex justify-between">
                    <span>Product ID: {item.productId.toString()}</span>
                    <span>Quantity: {item.quantity.toString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {order.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleAccept(order.id)}
                  disabled={updateOrderStatus.isPending}
                  className="gap-2"
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept Order
                </Button>
                <Button
                  onClick={() => handleDecline(order.id)}
                  disabled={updateOrderStatus.isPending}
                  className="gap-2"
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4" />
                  Decline Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
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
    stock: product?.stock.toString() || '100',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock, 10);

    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast.error('Please enter a valid stock quantity (non-negative number)');
      return;
    }

    try {
      if (product) {
        await editProduct.mutateAsync({
          id: product.id,
          title: formData.title,
          description: formData.description,
          price,
          category: formData.category,
          imageUrl: formData.imageUrl,
          stock: BigInt(stock),
        });
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync({
          title: formData.title,
          description: formData.description,
          price,
          category: formData.category,
          imageUrl: formData.imageUrl,
          stock: BigInt(stock),
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
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (INR)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={addProduct.isPending || editProduct.isPending}
        >
          {addProduct.isPending || editProduct.isPending
            ? 'Saving...'
            : product
            ? 'Update Product'
            : 'Add Product'}
        </Button>
      </div>
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
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Product deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  if (products.length === 0) {
    return <p className="text-muted-foreground">No products yet. Add your first product to get started.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id.toString()}>
            <TableCell className="font-medium">{product.title}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>{formatINR(product.price)}</TableCell>
            <TableCell>
              <span
                className={`font-semibold ${
                  Number(product.stock) === 0
                    ? 'text-destructive'
                    : Number(product.stock) < 10
                    ? 'text-warning'
                    : ''
                }`}
              >
                {product.stock.toString()}
              </span>
            </TableCell>
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
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
