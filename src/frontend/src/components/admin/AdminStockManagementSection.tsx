import { useState } from 'react';
import { useUpdateProductStock } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/backend';

interface AdminStockManagementSectionProps {
  products: Product[];
}

export default function AdminStockManagementSection({ products }: AdminStockManagementSectionProps) {
  const updateStock = useUpdateProductStock();
  const [stockValues, setStockValues] = useState<Record<string, string>>({});
  const [pendingProducts, setPendingProducts] = useState<Set<string>>(new Set());

  const handleStockChange = (productId: string, value: string) => {
    // Allow only non-negative integers
    if (value === '' || /^\d+$/.test(value)) {
      setStockValues((prev) => ({ ...prev, [productId]: value }));
    }
  };

  const handleSaveStock = async (product: Product) => {
    const productIdStr = product.id.toString();
    const newStockStr = stockValues[productIdStr];

    if (newStockStr === undefined || newStockStr === '') {
      toast.error('Please enter a stock quantity');
      return;
    }

    const newStock = parseInt(newStockStr, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Stock quantity must be a non-negative number');
      return;
    }

    setPendingProducts((prev) => new Set(prev).add(productIdStr));

    try {
      await updateStock.mutateAsync({
        productId: product.id,
        newStock: BigInt(newStock),
      });
      toast.success(`Stock updated for ${product.title}`);
      // Clear the input after successful update
      setStockValues((prev) => {
        const updated = { ...prev };
        delete updated[productIdStr];
        return updated;
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stock');
    } finally {
      setPendingProducts((prev) => {
        const updated = new Set(prev);
        updated.delete(productIdStr);
        return updated;
      });
    }
  };

  const getCurrentStockValue = (product: Product): string => {
    const productIdStr = product.id.toString();
    return stockValues[productIdStr] !== undefined
      ? stockValues[productIdStr]
      : product.stock.toString();
  };

  const isProductPending = (productId: bigint): boolean => {
    return pendingProducts.has(productId.toString());
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No products available. Add products first to manage stock.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Update stock quantities for your products. Stock is automatically reduced when customers place orders.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Stock Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">New Stock</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isPending = isProductPending(product.id);
                const currentValue = getCurrentStockValue(product);
                const hasChanged = currentValue !== product.stock.toString();

                return (
                  <TableRow key={product.id.toString()}>
                    <TableCell className="font-mono text-sm">{product.id.toString()}</TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          Number(product.stock) === 0
                            ? 'text-destructive'
                            : Number(product.stock) < 10
                            ? 'text-warning'
                            : 'text-foreground'
                        }`}
                      >
                        {product.stock.toString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={currentValue}
                        onChange={(e) => handleStockChange(product.id.toString(), e.target.value)}
                        disabled={isPending}
                        className="w-24 ml-auto text-right"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleSaveStock(product)}
                        disabled={isPending || !hasChanged}
                        className="gap-2"
                      >
                        <Save className="h-3 w-3" />
                        {isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
